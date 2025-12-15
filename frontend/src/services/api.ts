// src/services/api.ts
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function buildUrl(path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${BASE_URL}${path}`;
}

function getToken() {
  return localStorage.getItem("access_token");
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: any;
    token?: string | null;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    auth?: boolean; // ✅ NUEVO
  } = {}
): Promise<T> {
  const method = options.method ?? "GET";
  const url = buildUrl(path);

  const useAuth = options.auth !== false;
  const token = useAuth ? (options.token ?? getToken()) : null;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ?? {}),
  };

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body:
      options.body === undefined
        ? undefined
        : options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body),
    signal: options.signal,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const data = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error || data.msg)) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}
