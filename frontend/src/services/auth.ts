import { apiRequest } from "./api";
import type { LoginRequest, LoginResponse, MeResponse } from "../types/auth";

const AUTH_PREFIX = "/auth";

export const authService = {
  async login(payload: LoginRequest) {
    const data = await apiRequest<LoginResponse>(`${AUTH_PREFIX}/login`, {
      method: "POST",
      body: payload,
    });

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    return data;
  },

  async me() {
    return apiRequest<MeResponse>(`${AUTH_PREFIX}/me`, { method: "GET" });
  },

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  getToken() {
    return localStorage.getItem("access_token");
  },
};
