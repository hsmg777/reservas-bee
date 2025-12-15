export type UserRole = "admin" | "user" | "seguridad";


export interface UserDTO {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
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

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type RegisterResponse = {
  message: string;
  user: UserDTO;
};


export type UsersListResponse = {
  items: UserDTO[];
};

export type DeleteUserResponse = {
  message: "DELETED";
};