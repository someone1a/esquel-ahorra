export interface User {
  id: number;
  email: string;
  name: string;
  lastname: string;
  rol: string;
  points: number;
  corrections_count: number;
  referral_code?: string | null;
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
  referral_code?: string | null;
}
