import { LoginRequest, RegisterRequest, Token, User } from "@/types/auth";
import { api } from "./api";

export const authService = {
  async login(data: LoginRequest): Promise<Token> {
    return api.post("/auth/login", data);
  },

  async register(data: RegisterRequest): Promise<Token> {
    return api.post("/auth/register", data);
  },

  async getMe(): Promise<User> {
    return api.get("/auth/me");
  },

  async refreshToken(refreshToken: string): Promise<Token> {
    return api.post(`/auth/refresh?refresh_token=${refreshToken}`);
  },
};
