import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import type { EventDTO } from "../../types/event";
import { EventsService } from "../../services/events.service";
import PublicReservaForm from "../../components/public/PublicReservaForm";

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
                (Por ahora es solo visual. Luego lo conectamos con reservas.)
              </p>

              <div className="mt-6">
                <PublicReservaForm
                  disabled={loading || !event}
                  onSubmit={() =>
                    Swal.fire("Listo", "Luego conectamos este formulario 😉", "info")
                  }
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

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
