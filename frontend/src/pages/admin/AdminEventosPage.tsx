import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Swal from "sweetalert2";
import {
  CalendarPlus,
  Pencil,
  Trash2,
  QrCode,
  RefreshCcw,
  LayoutDashboard,
} from "lucide-react";

import type { EventDTO, EventCreatePayload, EventUpdatePayload } from "../../types/event";
import { EventsService } from "../../services/events.service";
import { qrBlobToObjectUrl, revokeObjectUrl } from "../../utils/qr";

type Mode = "create" | "edit";

export default function AdminEventosPage() {
  const [items, setItems] = useState<EventDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selected, setSelected] = useState<EventDTO | null>(null);

  const title = useMemo(() => (mode === "create" ? "Crear evento" : "Editar evento"), [mode]);

  async function load() {
    setLoading(true);
    try {
      const res = await EventsService.listPublic();
      setItems(res.items);
    } catch (e: any) {
      Swal.fire("Error", e?.message ?? "No se pudo cargar eventos", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setMode("create");
    setSelected(null);
    setOpen(true);
  }

  function openEdit(ev: EventDTO) {
    setMode("edit");
    setSelected(ev);
    setOpen(true);
  }

  async function onSubmit(payload: EventCreatePayload | EventUpdatePayload) {
    try {
      if (mode === "create") {
        await EventsService.create(payload as EventCreatePayload);
        Swal.fire("Listo", "Evento creado correctamente", "success");
      } else if (selected) {
        await EventsService.update(selected.id, payload as EventUpdatePayload);
        Swal.fire("Listo", "Evento actualizado correctamente", "success");
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      Swal.fire("Error", e?.message ?? "No se pudo guardar", "error");
    }
  }

  async function onDelete(ev: EventDTO) {
    const res = await Swal.fire({
      title: "¿Eliminar evento?",
      text: `Se eliminará: ${ev.name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!res.isConfirmed) return;

    try {
      await EventsService.remove(ev.id);
      Swal.fire("Eliminado", "Evento eliminado correctamente", "success");
      await load();
    } catch (e: any) {
      Swal.fire("Error", e?.message ?? "No se pudo eliminar", "error");
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-yellow-300/25 blur-3xl" />
        <div className="absolute top-10 -right-56 h-[560px] w-[560px] rounded-full bg-sky-200/35 blur-3xl" />
      </div>

      <div className="relative">
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-extrabold tracking-tight">Admin · Eventos</p>
                <p className="text-xs text-slate-500">Bee Concert Club</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={load}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                title="Refrescar"
              >
                <RefreshCcw className="h-4 w-4" />
                Refrescar
              </button>

              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <CalendarPlus className="h-4 w-4" />
                Nuevo evento
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Eventos</h1>
              <p className="mt-2 text-slate-600">
                Listado público (GET). Crear/editar/eliminar requiere admin.
              </p>
            </div>

            <NavLink
              to="/admin"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Volver al panel
            </NavLink>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-[0_14px_35px_rgba(2,6,23,0.08)]">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <p className="font-extrabold">Listado</p>
              <span className="text-xs text-slate-500">
                {loading ? "Cargando..." : `${items.length} evento(s)`}
              </span>
            </div>

            <div className="p-6">
              {items.length === 0 && !loading ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
                  No hay eventos todavía. Crea el primero.
                </div>
              ) : (
                <div className="grid gap-4">
                  {items.map((ev) => (
                    <div
                      key={ev.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold truncate">{ev.name}</p>
                          <StatusBadge status={ev.status} />
                        </div>
                        <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                          {ev.description ?? "—"}
                        </p>
                        <div className="mt-2 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                          <span>Inicio: {formatDate(ev.start_at)}</span>
                          <span>Fin: {formatDate(ev.end_at)}</span>
                          <span className="font-mono">code: {ev.public_code}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <QrButton eventId={ev.id} />

                        <button
                          onClick={() => openEdit(ev)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </button>

                        <button
                          onClick={() => onDelete(ev)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 text-xs text-slate-500">© 2025 Bee Concert Club · Admin</div>
        </main>

        {open && (
          <EventModal
            title={title}
            mode={mode}
            initial={selected}
            onClose={() => setOpen(false)}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </div>
  );
}

/* ----------------- Components ----------------- */

function StatusBadge({ status }: { status: EventDTO["status"] }) {
  const map: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ended: "bg-sky-50 text-sky-700 border-sky-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${map[status] ?? map.draft}`}>
      {status}
    </span>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function QrButton({ eventId }: { eventId: number }) {
  const [busy, setBusy] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => revokeObjectUrl(imgUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openQr() {
    setBusy(true);
    try {
      const blob = await EventsService.getQrBlob(eventId);
      const url = qrBlobToObjectUrl(blob);

      // libera anterior si existía
      revokeObjectUrl(imgUrl);
      setImgUrl(url);

      await Swal.fire({
        title: "QR del evento",
        html: `<div style="display:flex;justify-content:center;"><img alt="QR" src="${url}" style="width:260px;height:260px;border-radius:16px;border:1px solid #e2e8f0;"/></div>`,
        showCloseButton: true,
        confirmButtonText: "Cerrar",
      });
    } catch (e: any) {
      Swal.fire("Error", e?.message ?? "No se pudo generar QR", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={openQr}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
      title="Ver QR"
    >
      <QrCode className="h-4 w-4" />
      {busy ? "QR..." : "QR"}
    </button>
  );
}

/* ----------------- Modal ----------------- */

function EventModal({
  title,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  title: string;
  mode: Mode;
  initial: EventDTO | null;
  onClose: () => void;
  onSubmit: (payload: EventCreatePayload | EventUpdatePayload) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startAt, setStartAt] = useState(toLocalInput(initial?.start_at) ?? "");
  const [endAt, setEndAt] = useState(toLocalInput(initial?.end_at) ?? "");
  const [status, setStatus] = useState<EventDTO["status"]>(initial?.status ?? "draft");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (name.trim().length < 2) {
      Swal.fire("Validación", "El nombre es obligatorio (min 2).", "warning");
      return;
    }
    if (!startAt || !endAt) {
      Swal.fire("Validación", "start_at y end_at son obligatorios.", "warning");
      return;
    }
    if (new Date(endAt) <= new Date(startAt)) {
      Swal.fire("Validación", "La fecha fin debe ser mayor a la de inicio.", "warning");
      return;
    }

    setSaving(true);
    try {
      const payloadBase = {
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        start_at: new Date(startAt).toISOString(),
        end_at: new Date(endAt).toISOString(),
        status,
      };

      if (mode === "create") {
        await onSubmit(payloadBase as EventCreatePayload);
      } else {
        // update puede ser parcial, pero enviamos todo para simplificar
        await onSubmit(payloadBase as EventUpdatePayload);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-2xl rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(2,6,23,0.25)]">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <p className="font-extrabold">{title}</p>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>

          <div className="p-6 grid gap-4">
            <div>
              <label className="text-sm font-bold">Nombre</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Concierto..."
              />
            </div>

            <div>
              <label className="text-sm font-bold">Descripción</label>
              <textarea
                value={description ?? ""}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full min-h-[90px] rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Detalles del evento..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-bold">Fecha inicio</label>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label className="text-sm font-bold">Fecha fin</label>
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-bold">Estado</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="draft">draft</option>
                  <option value="active">active</option>
                  <option value="ended">ended</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>

              <div className="text-xs text-slate-500 flex items-end">
                <p>
                  El QR se genera desde el backend usando el <b>public_code</b>.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              onClick={submit}
              disabled={saving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
