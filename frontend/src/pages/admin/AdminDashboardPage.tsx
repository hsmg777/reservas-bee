import { NavLink } from "react-router-dom";
import {
  CalendarPlus,
  Ticket,
  HelpCircle,
  LayoutDashboard,
} from "lucide-react";

export default function AdminDashboardPage() {
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
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-extrabold tracking-tight">
                  Panel administrativo
                </p>
                <p className="text-xs text-slate-500">Bee Concert Club</p>
              </div>
            </div>

            <div className="hidden sm:block text-xs font-semibold text-slate-500">
              Accesos rápidos
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              ¿Qué quieres hacer hoy?
            </h1>
            <p className="mt-2 text-slate-600">
              Elige una opción para empezar. (Luego conectamos todo con la API).
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ActionCard
              to="/admin/eventos"
              title="Eventos"
              desc="Gestionar eventos."
              icon={<CalendarPlus className="h-5 w-5" />}
            />

            <ActionCard
              to="/admin/reservas"
              title="Reservas"
              desc="Revisar y gestionar reservas."
              icon={<Ticket className="h-5 w-5" />}
            />

            <ActionCard
              to="/admin/ayuda"
              title="Ayuda"
              desc="Guía rápida y soporte."
              icon={<HelpCircle className="h-5 w-5" />}
            />
          </div>

          {/* Small footer note */}
          <div className="mt-10 text-xs text-slate-500">
            © 2025 Bee Concert Club · Admin
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- UI ---------- */

function ActionCard({
  to,
  title,
  desc,
  icon,
}: {
  to: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className="
        group rounded-[1.6rem]
        border border-slate-200
        bg-white/80 backdrop-blur-xl
        p-6
        shadow-[0_14px_35px_rgba(2,6,23,0.08)]
        hover:shadow-[0_18px_50px_rgba(2,6,23,0.12)]
        hover:-translate-y-0.5
        transition
        flex flex-col gap-4
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white">
          {icon}
        </div>

        <span className="text-slate-400 transition group-hover:text-slate-900 group-hover:translate-x-0.5">
          →
        </span>
      </div>

      <div>
        <p className="text-lg font-extrabold tracking-tight">{title}</p>
        <p className="mt-1 text-sm text-slate-600 leading-relaxed">{desc}</p>
      </div>
    </NavLink>
  );
}
