export type ReservationStatus = "created" | "cancelled" | "checked_in";

export type ReservationCreatePayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  instagram?: string | null;
};


export type ReservationDTO = {
  id: number;
  event_id: number;

  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  instagram?: string | null;

  reservation_code: string;
  status: ReservationStatus;

  used_at: string | null;
  scan_count: number;
  last_scan_at: string | null;

  email_sent_at: string | null;
  email_send_status: string | null;

  created_at: string;

  checkin_url: string;
  qr_url: string;
};

export type ReservationListDTO = {
  total: number;
  items: ReservationDTO[];
};


// ✅ lo que devuelve /reservations/checkin/:code
export type CheckinReservationDTO = {
  id: number;
  first_name: string;
  last_name: string;
  status: ReservationStatus;
  used_at?: string | null;
};

export type CheckinResponseDTO = {
  ok: boolean;
  message: string; // OK | ALREADY_USED | NOT_FOUND | ...
  reservation_id: number | null;
  used_at: string | null;

  // ✅ NUEVO (si el backend ya lo manda)
  reservation?: CheckinReservationDTO | null;
};
