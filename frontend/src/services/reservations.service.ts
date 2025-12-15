import { apiRequest } from "./api";
import type {
  ReservationDTO,
  ReservationCreatePayload,
  CheckinResponseDTO,
  ReservationListDTO
} from "../types/reservation";

const RES_BASE = "/reservations";

export const ReservationsService = {
  /**
   * ✅ Público: crear reserva por public_code del evento
   * POST /api/reservations/public/:publicCode
   */
  createPublic: (publicCode: string, payload: ReservationCreatePayload) =>
    apiRequest<ReservationDTO>(`${RES_BASE}/public/${publicCode}`, {
      method: "POST",
      body: payload,
    }),

  /**
   * ✅ Público: QR PNG (blob)
   * GET /api/reservations/:id/qr
   */
  getQrBlob: async (reservationId: number): Promise<Blob> => {
    const base = import.meta.env.VITE_API_URL || "/api";
    const url = `${base}/reservations/${reservationId}/qr`;

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error(`QR request failed (${res.status})`);
    return await res.blob();
  },

  /**
   * ✅ Seguridad/Admin: check-in (1 vez)
   * POST /api/reservations/checkin/:reservationCode
   * (requiere JWT -> apiRequest ya adjunta Authorization si hay token)
   */
  checkin: (reservationCode: string) =>
    apiRequest<CheckinResponseDTO>(`${RES_BASE}/checkin/${reservationCode}`, {
      method: "POST",
    }),

  listByEvent: (eventId: number) =>
    apiRequest<ReservationListDTO>(`${RES_BASE}/event/${eventId}`, {
      method: "GET",
    }),
};
