export interface User {
  id: number;
  email: string;
  name: string;
  lastname: string;
  rol: string;
  points: number;
  corrections_count: number;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
  rol: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  lastname: string;
  password: string;
  confirm_password: string;
  rol: string;
}

export interface ActivateRequest {
   token: string;
   password: string;
   confirm_password: string;
 }
 
 export interface ValidateTokenResponse {
   valid: boolean;
   message?: string;
   email?: string;
   expires_at?: string;
 }
