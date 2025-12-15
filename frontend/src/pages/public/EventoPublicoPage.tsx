import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import type { EventDTO } from "../../types/event";
import { EventsService } from "../../services/events.service";
import PublicReservaForm from "../../components/public/PublicReservaForm";

import type { ReservationCreatePayload } from "../../types/reservation";
import { ReservationsService } from "../../services/reservations.service";
import { qrBlobToObjectUrl, revokeObjectUrl } from "../../utils/qr";

export default function EventoPublicoPage() {
  const { publicCode } = useParams<{ publicCode: string }>();

  const [event, setEvent] = useState<EventDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!publicCode) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const ev = await EventsService.getPublicByCode(publicCode);
        setEvent(ev);
      } catch (e: any) {
        setEvent(null);
        Swal.fire("Error", e?.message ?? "Evento no encontrado", "error");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [publicCode]);

  async function handleCreateReservation(payload: ReservationCreatePayload) {
    if (!publicCode) return;

    try {
      // 1) crear reserva
      const reservation = await ReservationsService.createPublic(publicCode, payload);

      // 2) pedir QR (PNG)
      const blob = await ReservationsService.getQrBlob(reservation.id);
      const url = qrBlobToObjectUrl(blob);

      // 3) mostrar QR
      await Swal.fire({
        title: "Reserva creada ✅",
        html: `
          <p style="margin:0 0 10px 0;opacity:.85">
            Te enviamos tu QR al correo. También lo tienes aquí:
          </p>
          <div style="display:flex;justify-content:center;">
            <img alt="QR" src="${url}"
              style="width:260px;height:260px;border-radius:16px;border:1px solid #2a2a2a;background:#fff;padding:10px;" />
          </div>
          <p style="margin:10px 0 0 0;font-size:12px;opacity:.7">
            Código: <span style="font-family:monospace;">${reservation.reservation_code}</span>
          </p>
        `,
        showCloseButton: true,
        confirmButtonText: "Cerrar",
        didClose: () => revokeObjectUrl(url),
      });
    } catch (e: any) {
      Swal.fire("Error", e?.message ?? "No se pudo crear la reserva", "error");
    }
  }

  return (
    <section className="bg-black text-white py-6">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-24 left-10 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-24 right-10 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
              <span className="text-xs font-extrabold tracking-[0.25em] text-white/75 uppercase">
                Reserva
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {loading ? "Cargando..." : event?.name ?? "Evento"}
            </h1>

            <p className="mt-4 text-white/70 text-base sm:text-lg leading-relaxed">
              {loading
                ? "Obteniendo datos del evento..."
                : event?.description ??
                  "Escaneaste el QR correcto. Completa el formulario para continuar."}
            </p>

            {/* Info simple debajo */}
            <div className="mt-4 grid gap-1 text-sm text-white/60">
              <p className="mt-2 text-xs text-white/45">
                Recuerda: la reserva no garantiza tu entrada al evento.
              </p>
            </div>
          </div>

          <NavLink
            to="/"
            className="
              shrink-0 inline-flex items-center justify-center
              rounded-2xl px-5 py-3
              border border-white/10
              bg-white/5
              backdrop-blur-xl
              text-sm font-semibold text-white/80
              hover:bg-white/10 hover:text-white
              transition
            "
          >
            Volver
          </NavLink>
        </div>

        {/* FORM: protagonista */}
        <div className="mt-10">
          <div className="mx-auto max-w-2xl">
            <Card>
              <h2 className="text-sm font-extrabold tracking-[0.25em] text-white/80 uppercase">
                Completa tu reserva
              </h2>

              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                Completa tus datos para generar tu reserva y obtener tu QR.
              </p>

              <div className="mt-6">
                <PublicReservaForm
                  disabled={loading || !event}
                  onSubmit={handleCreateReservation}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- UI bits ---------- */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        rounded-3xl
        border border-white/10
        bg-white/5
        p-6
        backdrop-blur-xl
        shadow-[0_18px_55px_rgba(0,0,0,0.45)]
      "
    >
      {children}
    </div>
  );
}
