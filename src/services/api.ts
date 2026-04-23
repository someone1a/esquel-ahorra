import { storage } from "@/utils/storage";
import { Platform } from "react-native";

export const API_BASE_URL = "http://192.168.10.107:8000";
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
      // Si recibimos un 401 (No autorizado) en la web, forzamos cierre total
      if (Platform.OS === "web") {
        await storage.clear();
        window.location.replace("/welcome");
      }
      const error = new Error("Unauthorized") as any;
      error.status = 401;
      throw error;
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
