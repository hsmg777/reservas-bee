import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { LayoutDashboard, LogOut, Ticket, RefreshCw } from "lucide-react";

import { authService } from "../../services/auth";
import { ReservationsService } from "../../services/reservations.service";
import { EventsService } from "../../services/events.service";

import type { ReservationDTO } from "../../types/reservation";
import type { EventDTO } from "../../types/event";

export default function AdminReservasPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventDTO[]>([]);
  const [eventId, setEventId] = useState<number | "">("");
  const [items, setItems] = useState<ReservationDTO[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  async function handleLogout() {
    const res = await Swal.fire({
      title: "Cerrar sesión",
      text: "¿Seguro que deseas salir del panel?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    });

    if (!res.isConfirmed) return;

    authService.logout();
    navigate("/login", { replace: true });
  }

  async function loadEvents() {
    setLoadingEvents(true);
    try {
      // ✅ tu service real
      const res = await EventsService.listPublic();
      const evs = res.items ?? [];
      setEvents(evs);

      // seleccionar primero por defecto si no hay seleccionado
      if (!eventId && evs.length) setEventId(evs[0].id);
    } catch {
      await Swal.fire({
        icon: "error",
        title: "No se pudieron cargar eventos",
        text: "Revisa tu sesión o el servidor.",
      });
    } finally {
      setLoadingEvents(false);
    }
  }

  async function loadReservationsByEvent(id: number) {
    setLoadingList(true);
    try {
      const res = await ReservationsService.listByEvent(id);
      setItems(res.items ?? []);
    } catch {
      await Swal.fire({
        icon: "error",
        title: "No se pudieron cargar reservas",
        text: "Revisa permisos (admin/seguridad) o el servidor.",
      });
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof eventId === "number") loadReservationsByEvent(eventId);
  }, [eventId]);

  const headerRight = useMemo(() => {
    const disabled = loadingEvents || loadingList || typeof eventId !== "number";
    return (
      <button
        onClick={() => typeof eventId === "number" && loadReservationsByEvent(eventId)}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        title="Refrescar"
      >
        <RefreshCw className="h-4 w-4" />
        Refrescar
      </button>
    );
  }, [eventId, loadingEvents, loadingList]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Soft background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-yellow-300/25 blur-3xl" />
        <div className="absolute top-10 -right-56 h-[560px] w-[560px] rounded-full bg-sky-200/35 blur-3xl" />
      </div>

      <div className="relative">
        {/* Topbar */}
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <Ticket className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-extrabold tracking-tight">Reservas</p>
                <p className="text-xs text-slate-500">Bee Concert Club</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NavLink
                to="/admin"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                title="Volver al dashboard"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>

              {headerRight}

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Lista de reservas
              </h1>
              <p className="mt-2 text-slate-600">
                Selecciona un evento para ver quién reservó.
              </p>
            </div>

            {/* Event selector */}
            <div className="w-full sm:w-[420px]">
              <label className="text-sm font-extrabold text-slate-900">Evento</label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value ? Number(e.target.value) : "")}
                disabled={loadingEvents}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-yellow-300/60 focus:ring-2 focus:ring-yellow-300/25 disabled:opacity-60"
              >
                {events.length === 0 ? (
                  <option value="">
                    {loadingEvents ? "Cargando eventos..." : "No hay eventos"}
                  </option>
                ) : (
                  events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} · {ev.status}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="mt-8 overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white/80 shadow-[0_14px_35px_rgba(2,6,23,0.08)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div className="text-sm font-extrabold">
                {loadingList ? "Cargando..." : `${items.length} reservas`}
              </div>
              <div className="text-xs text-slate-500">Solo lectura (por ahora)</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Nombre</th>
                    <th className="px-6 py-3">Contacto</th>
                    <th className="px-6 py-3">Instagram</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Creado</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td className="px-6 py-6 text-slate-500" colSpan={5}>
                        {loadingList ? "Cargando reservas..." : "No hay reservas para este evento."}
                      </td>
                    </tr>
                  ) : (
                    items.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/60">
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-slate-900">
                            {r.first_name} {r.last_name}
                          </div>
                          <div className="text-xs text-slate-500">
                            Código:{" "}
                            <span className="font-mono">{r.reservation_code.slice(0, 10)}…</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-slate-800">{r.email}</div>
                          <div className="text-xs text-slate-500">{r.phone}</div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-slate-700">{r.instagram ? r.instagram : "—"}</span>
                        </td>

                        <td className="px-6 py-4">
                          <StatusPill status={r.status} usedAt={r.used_at} />
                        </td>

                        <td className="px-6 py-4 text-slate-700">{formatDate(r.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 text-xs text-slate-500">© 2025 Bee Concert Club · Admin</div>
        </main>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function StatusPill({
  status,
  usedAt,
}: {
  status: ReservationDTO["status"];
  usedAt: string | null;
}) {
  const label =
    status === "checked_in" ? "Check-in" : status === "cancelled" ? "Cancelada" : "Creada";

  const tone =
    status === "checked_in"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "cancelled"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-yellow-50 text-yellow-800 border-yellow-200";

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-extrabold ${tone}`}>
        {label}
      </span>
      {usedAt ? (
        <span className="text-[11px] text-slate-500">Usado: {formatDate(usedAt)}</span>
      ) : (
        <span className="text-[11px] text-slate-400">No usado</span>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}
