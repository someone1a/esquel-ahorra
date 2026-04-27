import { ActivateRequest, LoginRequest, RegisterRequest, Token, User, ValidateTokenResponse } from "@/types/auth";
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

  async logout(): Promise<void> {
    await api.post("/auth/logout", undefined);
  },

  async validateActivationToken(token: string): Promise<ValidateTokenResponse> {
    return api.get(`/auth/activate/validate?token=${token}`);
  },

  async activateAccount(data: ActivateRequest): Promise<void> {
     return api.post("/auth/activate", data);
   },
 
   async inviteSupervisor(email: string): Promise<void> {
     return api.post("/auth/invite", { email });
   },
 };
