import { Token, User } from "@/types/auth";
import { storage } from "@/utils/storage";

const ACCESS_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";

export type StoredAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthSnapshot = {
  tokens: StoredAuthTokens | null;
  user: User | null;
};

type Listener = (snapshot: AuthSnapshot) => void;

let snapshot: AuthSnapshot = { tokens: null, user: null };
let hydrated = false;
let hydratePromise: Promise<void> | null = null;
let listeners: Listener[] = [];
let sessionVersion = 0;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isProbablyToken(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;
  const token = value.trim();
  if (token.length < 16 || token.length > 4096) return false;
  if (/\s/.test(token)) return false;
  return true;
}

function parseStoredUser(value: string | null): User | null {
  if (!isNonEmptyString(value)) return null;
  try {
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
}

async function hydrateFromStorage() {
  const [accessToken, refreshToken, userRaw] = await Promise.all([
    storage.getItem(ACCESS_TOKEN_KEY),
    storage.getItem(REFRESH_TOKEN_KEY),
    storage.getItem(USER_KEY),
  ]);

  const tokens =
    isProbablyToken(accessToken) && isProbablyToken(refreshToken)
      ? { accessToken: accessToken.trim(), refreshToken: refreshToken.trim() }
      : null;

  const user = parseStoredUser(userRaw);

  snapshot = { tokens, user };
  hydrated = true;
}

export async function ensureAuthHydrated() {
  if (hydrated) return;
  if (!hydratePromise) {
    hydratePromise = hydrateFromStorage().finally(() => {
      hydratePromise = null;
    });
  }
  await hydratePromise;
}

export async function getAuthSnapshot(): Promise<AuthSnapshot> {
  await ensureAuthHydrated();
  return snapshot;
}

export function getSessionVersion() {
  return sessionVersion;
}

export async function getAccessToken(): Promise<string | null> {
  await ensureAuthHydrated();
  return snapshot.tokens?.accessToken ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  await ensureAuthHydrated();
  return snapshot.tokens?.refreshToken ?? null;
}

export async function setTokens(token: Token) {
  const accessToken = token?.access_token;
  const refreshToken = token?.refresh_token;

  if (!isProbablyToken(accessToken) || !isProbablyToken(refreshToken)) {
    throw new Error("Invalid token format");
  }

  const nextTokens: StoredAuthTokens = {
    accessToken: accessToken.trim(),
    refreshToken: refreshToken.trim(),
  };

  await Promise.all([
    storage.setItem(ACCESS_TOKEN_KEY, nextTokens.accessToken),
    storage.setItem(REFRESH_TOKEN_KEY, nextTokens.refreshToken),
  ]);

  snapshot = { ...snapshot, tokens: nextTokens };
  sessionVersion += 1;
  notify();
}

export async function setUser(user: User | null) {
  if (!user) {
    await storage.removeItem(USER_KEY);
    snapshot = { ...snapshot, user: null };
  } else {
    await storage.setItem(USER_KEY, JSON.stringify(user));
    snapshot = { ...snapshot, user };
  }
  notify();
}

export async function clearAuthStorage() {
  await Promise.all([
    storage.removeItem(ACCESS_TOKEN_KEY),
    storage.removeItem(REFRESH_TOKEN_KEY),
    storage.removeItem(USER_KEY),
  ]);

  snapshot = { tokens: null, user: null };
  hydrated = true;
  sessionVersion += 1;
  notify();
}

export function subscribeAuth(listener: Listener) {
  listeners = [...listeners, listener];
  listener(snapshot);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notify() {
  for (const listener of listeners) listener(snapshot);
}

