export type EventStatus = "draft" | "active" | "ended" | "cancelled";

export interface EventDTO {
  id: number;
  name: string;
  description: string | null;
  start_at: string; // ISO string
  end_at: string;   // ISO string
  status: EventStatus;
  public_code: string;

  public_url: string; // ya viene del backend
  qr_url: string;     // ej: "/api/events/1/qr"
}

export interface EventListDTO {
  items: EventDTO[];
}

export interface EventCreatePayload {
  name: string;
  description?: string | null;
  start_at: string; // ISO 8601
  end_at: string;   // ISO 8601
  status?: EventStatus;
}

export interface EventUpdatePayload {
  name?: string;
  description?: string | null;
  start_at?: string; // ISO
  end_at?: string;   // ISO
  status?: EventStatus;
}
