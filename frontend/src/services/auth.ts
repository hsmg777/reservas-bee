import { apiRequest } from "./api";
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
  UsersListResponse,
  DeleteUserResponse,
} from "../types/auth";

const AUTH_PREFIX = "/auth";

export const authService = {
  async login(payload: LoginRequest) {
    const data = await apiRequest<LoginResponse>(`${AUTH_PREFIX}/login`, {
      method: "POST",
      body: payload,
      token: null, // ✅ evita mandar Bearer viejo
    });

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    return data;
  },

  async register(payload: RegisterRequest) {
    return apiRequest<RegisterResponse>(`${AUTH_PREFIX}/register`, {
      method: "POST",
      body: payload,
    });
  },

  async me() {
    return apiRequest<MeResponse>(`${AUTH_PREFIX}/me`, { method: "GET" });
  },

  async listUsers() {
    return apiRequest<UsersListResponse>(`${AUTH_PREFIX}/users`, { method: "GET" });
  },

  async deleteUser(userId: number) {
    return apiRequest<DeleteUserResponse>(`${AUTH_PREFIX}/users/${userId}`, {
      method: "DELETE",
    });
  },

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  getToken() {
    return localStorage.getItem("access_token");
  },
};
