import { clearAuthStorage, getAccessToken, getRefreshToken, setTokens } from "@/auth/session";
import { Token } from "@/types/auth";

export const API_BASE_URL = "https://api.esquel-ahorra.online";
type ApiError = Error & { status?: number; data?: unknown };

function createApiError(message: string, status?: number, data?: unknown): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.data = data;
  return error;
}

async function safeJson(response: Response) {
  return response.json().catch(() => undefined);
}

let refreshInFlight: Promise<Token> | null = null;

async function refreshTokens(): Promise<Token> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await clearAuthStorage().catch(() => {});
    throw createApiError("Unauthorized", 401);
  }

  const response = await fetch(
    `${API_BASE_URL}/auth/refresh?refresh_token=${encodeURIComponent(refreshToken)}`,
    { method: "POST", headers: { "Content-Type": "application/json" } }
  );

  if (!response.ok) {
    const errorData = await safeJson(response);
    await clearAuthStorage().catch(() => {});
    throw createApiError(
      (errorData as any)?.detail || (errorData as any)?.message || "Token refresh failed",
      response.status,
      errorData
    );
  }

  const token = (await response.json()) as Token;
  try {
    await setTokens(token);
  } catch {
    await clearAuthStorage().catch(() => {});
    throw createApiError("Token refresh failed", 401);
  }
  return token;
}

async function getFreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = refreshTokens().finally(() => {
      refreshInFlight = null;
    });
  }

  await refreshInFlight;
  return await getAccessToken();
}

function shouldSkipAutoRefresh(endpoint: string) {
  return (
    endpoint.startsWith("/auth/login") ||
    endpoint.startsWith("/auth/register") ||
    endpoint.startsWith("/auth/refresh")
  );
}

export const api = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = await getAccessToken();

    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const requestInit: RequestInit = { ...options, headers };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestInit);

    if (response.status === 401 && !shouldSkipAutoRefresh(endpoint)) {
      const newToken = await getFreshAccessToken().catch(() => null);
      if (newToken) {
        const retryHeaders = new Headers(requestInit.headers);
        retryHeaders.set("Authorization", `Bearer ${newToken}`);
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...requestInit,
          headers: retryHeaders,
        });

        if (retryResponse.status !== 401) {
          if (!retryResponse.ok) {
            const errorData = await safeJson(retryResponse);
            throw createApiError(
              (errorData as any)?.detail || (errorData as any)?.message || "API request failed",
              retryResponse.status,
              errorData
            );
          }

          if (retryResponse.status === 204) return null;
          return retryResponse.json();
        }
      }

      await clearAuthStorage().catch(() => {});
      throw createApiError("Unauthorized", 401);
    }

    if (!response.ok) {
      const errorData = await safeJson(response);
      throw createApiError(
        (errorData as any)?.detail || (errorData as any)?.message || "API request failed",
        response.status,
        errorData
      );
    }

    if (response.status === 204) return null;
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
