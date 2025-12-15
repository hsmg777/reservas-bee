import { apiRequest } from "./api";
import type {
  EventDTO,
  EventListDTO,
  EventCreatePayload,
  EventUpdatePayload,
} from "../types/event";

const EVENTS_BASE = "/events";

/** Públicos */
export const EventsService = {
  listPublic: () => apiRequest<EventListDTO>(`${EVENTS_BASE}`, { method: "GET" }),

  getPublicById: (id: number) =>
    apiRequest<EventDTO>(`${EVENTS_BASE}/${id}`, { method: "GET" }),

  getPublicByCode: (publicCode: string) =>
    apiRequest<EventDTO>(`${EVENTS_BASE}/public/${publicCode}`, { method: "GET" }),

  /**
   * QR es PNG (no JSON). Usamos fetch directo para obtener Blob.
   * Si tu BASE_URL es "/api", el endpoint final será "/api/events/:id/qr"
   */
  getQrBlob: async (eventId: number): Promise<Blob> => {
    const base = import.meta.env.VITE_API_URL || "/api";
    const url = `${base}/events/${eventId}/qr`;

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error(`QR request failed (${res.status})`);
    return await res.blob();
  },

  /** Admin (JWT + role admin) */
  create: (payload: EventCreatePayload) =>
    apiRequest<EventDTO>(`${EVENTS_BASE}`, { method: "POST", body: payload }),

  update: (id: number, payload: EventUpdatePayload) =>
    apiRequest<EventDTO>(`${EVENTS_BASE}/${id}`, { method: "PUT", body: payload }),

  remove: (id: number) =>
    apiRequest<void>(`${EVENTS_BASE}/${id}`, { method: "DELETE" }),
};
