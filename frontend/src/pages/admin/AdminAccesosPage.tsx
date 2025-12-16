import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Swal from "sweetalert2";
import { LayoutDashboard, QrCode, RefreshCw } from "lucide-react";

import { EventsService } from "../../services/events.service";
import { EventAccessService } from "../../services/event-access.service";

import type { EventDTO } from "../../types/event";
import type { EventAccessCodeDTO } from "../../types/event-access";

import { qrBlobToObjectUrl, revokeObjectUrl } from "../../utils/qr";

export default function AdminAccesosPage() {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [eventId, setEventId] = useState<number | "">("");
  const [items, setItems] = useState<EventAccessCodeDTO[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  async function loadEvents() {
    setLoadingEvents(true);
    try {
      const res = await EventsService.listPublic();
      const evs = res.items ?? [];
      setEvents(evs);
      if (!eventId && evs.length) setEventId(evs[0].id);
    } catch (e: any) {
      await Swal.fire("Error", e?.message ?? "No se pudieron cargar eventos", "error");
    } finally {
      setLoadingEvents(false);
    }
  }

  async function loadAccessByEvent(id: number) {
    setLoadingList(true);
    try {
      const res = await EventAccessService.listByEvent(id);
      setItems(res.items ?? []);
    } catch (e: any) {
      await Swal.fire("Error", e?.message ?? "No se pudieron cargar accesos", "error");
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
    if (typeof eventId === "number") loadAccessByEvent(eventId);
  }, [eventId]);

  const totalScans = useMemo(() => {
    return (items ?? []).reduce((acc, x) => acc + (Number(x.scan_count) || 0), 0);
  }, [items]);

  const selectedEvent = useMemo(() => {
    if (typeof eventId !== "number") return null;
    return events.find((e) => e.id === eventId) ?? null;
  }, [events, eventId]);

  const headerRight = useMemo(() => {
    const disabled = loadingEvents || loadingList || typeof eventId !== "number";
    return (
      <button
        onClick={() => typeof eventId === "number" && loadAccessByEvent(eventId)}
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
                <QrCode className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-extrabold tracking-tight">Accesos (QR ilimitado)</p>
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
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Control de accesos
              </h1>
              <p className="mt-2 text-slate-600">
                Aquí ves cuántas veces se escaneó el QR ilimitado por evento.
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

          {/* Summary */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatCard title="Evento" value={selectedEvent?.name ?? "—"} />
            <StatCard title="Estado" value={selectedEvent?.status ?? "—"} />
            <StatCard title="Total accesos" value={String(totalScans)} />
          </div>

          {/* Table */}
          <div className="mt-8 overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white/80 shadow-[0_14px_35px_rgba(2,6,23,0.08)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div className="text-sm font-extrabold">
                {loadingList ? "Cargando..." : `${items.length} código(s) de acceso`}
              </div>
              <div className="text-xs text-slate-500">Se incrementa al escanear</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Label</th>
                    <th className="px-6 py-3">Código</th>
                    <th className="px-6 py-3">Escaneos</th>
                    <th className="px-6 py-3">Último scan</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">QR</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td className="px-6 py-6 text-slate-500" colSpan={6}>
                        {loadingList ? "Cargando..." : "No hay QRs ilimitados para este evento."}
                      </td>
                    </tr>
                  ) : (
                    items.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/60">
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-slate-900">{a.label ?? "—"}</div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-mono text-slate-800">{a.access_code}</span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-extrabold text-slate-900">{a.scan_count ?? 0}</span>
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {a.last_scan_at ? formatDate(a.last_scan_at) : "—"}
                        </td>

                        <td className="px-6 py-4">
                          <EnabledPill enabled={!!a.is_enabled} />
                        </td>

                        <td className="px-6 py-4">
                          {typeof eventId === "number" ? (
                            <QrPreviewButton eventId={eventId} accessId={a.id} />
                          ) : (
                            "—"
                          )}
                        </td>
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

/* ---------- UI helpers ---------- */

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 shadow-sm p-5">
      <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">{title}</div>
      <div className="mt-1 text-lg font-extrabold text-slate-900 truncate">{value}</div>
    </div>
  );
}

function EnabledPill({ enabled }: { enabled: boolean }) {
  const tone = enabled
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-rose-50 text-rose-700 border-rose-200";
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold ${tone}`}>
      {enabled ? "Habilitado" : "Deshabilitado"}
    </span>
  );
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function QrPreviewButton({ eventId, accessId }: { eventId: number; accessId: number }) {
  const [busy, setBusy] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => revokeObjectUrl(imgUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openQr() {
    setBusy(true);
    try {
      const blob = await EventAccessService.getQrBlob(eventId, accessId);
      const url = qrBlobToObjectUrl(blob);
      revokeObjectUrl(imgUrl);
      setImgUrl(url);

      await Swal.fire({
        title: "QR acceso ilimitado",
        html: `<div style="display:flex;justify-content:center;">
          <img alt="QR" src="${url}" style="width:260px;height:260px;border-radius:16px;border:1px solid #e2e8f0;"/>
        </div>`,
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
      {busy ? "QR..." : "Ver"}
    </button>
  );
}
