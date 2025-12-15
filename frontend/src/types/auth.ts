export type UserRole = "admin" | "user" | "seguridad";

export interface UserDTO {
  id: number;
  name?: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type?: "bearer" | "Bearer";
  expires_in?: number;
  user: UserDTO;
}

export interface MeResponse {
  user: UserDTO;
}
