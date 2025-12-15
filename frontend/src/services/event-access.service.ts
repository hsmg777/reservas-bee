import { apiRequest } from "./api";
import type {
  EventAccessCodeCreatePayload,
  EventAccessCodeDTO,
  EventAccessCodeListDTO,
  AccessCheckResponseDTO,
} from "../types/event-access";

// helper: construir URL absoluta para fetch del PNG (porque apiRequest asume JSON)
function buildApiUrl(path: string) {
  const base = import.meta.env.VITE_API_URL || "/api"; // mismo criterio que api.ts
  if (!path.startsWith("/")) path = `/${path}`;
  return `${base}${path}`;
}

export const EventAccessService = {
  // ADMIN: listar códigos del evento
  async listByEvent(eventId: number) {
    return await apiRequest<EventAccessCodeListDTO>(
      `/events/${eventId}/access-codes`,
      { method: "GET" }
    );
  },

  // ADMIN: crear código ilimitado
  async create(eventId: number, payload: EventAccessCodeCreatePayload) {
    return await apiRequest<EventAccessCodeDTO>(
      `/events/${eventId}/access-codes`,
      { method: "POST", body: payload }
    );
  },

  // ✅ PNG del QR (BLOB) -> usamos fetch directo porque apiRequest parsea json/text
  async getQrBlob(eventId: number, accessId: number): Promise<Blob> {
    const url = buildApiUrl(`/events/${eventId}/access-codes/${accessId}/qr`);
    const token = localStorage.getItem("access_token");

    const res = await fetch(url, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!res.ok) {
      // intenta leer texto para error
      const msg = await res.text().catch(() => "");
      throw new Error(msg || `No se pudo obtener QR (${res.status})`);
    }

    return await res.blob();
  },

  // SEGURIDAD/ADMIN: check + incrementa contador
  async check(accessCode: string) {
    return await apiRequest<AccessCheckResponseDTO>(
      `/access-codes/check/${encodeURIComponent(accessCode)}`,
      { method: "POST" }
    );
  },
};
