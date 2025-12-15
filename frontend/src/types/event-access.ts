export type EventAccessCodeCreatePayload = {
  label?: string | null;
};

export type EventAccessCodeDTO = {
  id: number;
  event_id: number;

  access_code: string;
  label?: string | null;

  is_enabled: boolean;

  scan_count: number;
  last_scan_at: string | null;

  created_by_user_id: number | null;
  created_at: string;

  access_url: string;
  qr_url: string; // viene como "/api/events/.../qr"
};

export type EventAccessCodeListDTO = {
  items: EventAccessCodeDTO[];
};

export type AccessCheckResponseDTO = {
  ok: boolean;
  message: string;

  event: {
    id: number;
    name: string;
    status: "draft" | "active" | "ended" | "cancelled";
    start_at: string;
    end_at: string;
  } | null;

  access: {
    id: number;
    event_id: number;
    label?: string | null;
    scan_count: number;
    last_scan_at: string | null;
    is_enabled: boolean;
  } | null;
};
