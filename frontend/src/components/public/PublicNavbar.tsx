import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

const links = [
  { to: "/eventos", label: "Eventos" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/conciertos", label: "Conciertos" },
  { to: "/politicas", label: "Políticas" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false); // lg
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        className="
          relative mx-auto max-w-6xl
          rounded-2xl
          border border-white/15
          bg-white/10
          shadow-[0_10px_30px_rgba(0,0,0,0.28)]
          backdrop-blur-xl backdrop-saturate-150
          overflow-hidden
        "
      >
        {/* light sweep */}
        <div className="pointer-events-none absolute -top-16 -left-24 h-56 w-[36rem] rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -top-24 right-0 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

        <div
          className="
            relative flex items-center justify-between gap-3
            px-4 py-3
            lg:px-6 lg:py-4
          "
        >
          {/* Brand */}
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3"
          >
            {/* Logo image (sin borde, más grande) */}
            <img
              src="/images/logoBEE.png"
              alt="Bee Concert Club"
              className="
                h-10 w-10 sm:h-11 sm:w-11
                lg:h-12 lg:w-12
                object-contain
                drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]
                select-none
              "
              draggable={false}
            />

            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold tracking-tight text-base lg:text-lg">
                Bee Concert Club
              </span>
            </div>
          </NavLink>

          {/* Desktop links (más grandes en PC) */}
          <div className="hidden lg:flex items-center gap-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  [
                    "px-4 py-2.5 rounded-xl font-semibold transition",
                    "text-white/90 hover:text-white",
                    "hover:bg-white/10 active:scale-[0.99]",
                    "text-[15px]",
                    isActive ? "bg-white/15 border border-white/15" : "",
                  ].join(" ")
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Burger */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menú"
              aria-expanded={open}
              className="
                lg:hidden
                inline-flex h-10 w-10 items-center justify-center
                rounded-xl
                border border-white/15
                bg-white/10
                hover:bg-white/15 transition
              "
            >
              <div className="flex flex-col gap-1">
                <span className="h-0.5 w-5 rounded bg-white/90" />
                <span className="h-0.5 w-5 rounded bg-white/90" />
                <span className="h-0.5 w-5 rounded bg-white/90" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div
          className={[
            "lg:hidden border-t border-white/10",
            "transition-[max-height] duration-200 ease-out overflow-hidden",
            open ? "max-h-80" : "max-h-0",
          ].join(" ")}
        >
          <div className="px-3 py-3 grid gap-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  [
                    "px-3 py-3 rounded-xl text-sm font-semibold transition",
                    "text-white/90 hover:text-white",
                    "bg-white/5 border border-white/10 hover:bg-white/10",
                    isActive ? "bg-white/15 border-white/15" : "",
                  ].join(" ")
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
