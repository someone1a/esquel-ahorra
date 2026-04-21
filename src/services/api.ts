import { storage } from "@/utils/storage";

export const API_BASE_URL = "https://api.esquel-ahorra.online";
const TOKEN_KEY = "auth_token";

async function getAuthToken() {
  return await storage.getItem(TOKEN_KEY);
}

export const api = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = await getAuthToken();
    
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Handle unauthorized (maybe logout or refresh token)
      // For now, let's just throw
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "API request failed");
    }

    // Return null if response is empty (e.g., 204 No Content)
    if (response.status === 204) {
      return null;
    }

    return response.json();
  },

  get(endpoint: string, options: RequestInit = {}) {
    return this.fetch(endpoint, { ...options, method: "GET" });
  },

  post(endpoint: string, body?: any, options: RequestInit = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put(endpoint: string, body?: any, options: RequestInit = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete(endpoint: string, options: RequestInit = {}) {
    return this.fetch(endpoint, { ...options, method: "DELETE" });
  },

  async healthCheck() {
    return this.get("/health-check");
  },
};
