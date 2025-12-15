import { useEffect, useMemo, useRef, useState } from "react";

type ConcertItem = {
  image: string;
  name: string;
};

export default function ConcertCarousel({
  items,
  autoPlayMs = 3600,
}: {
  items: ConcertItem[];
  autoPlayMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const hoverRef = useRef(false);

  const safeItems = useMemo(() => items.filter(Boolean), [items]);
  const total = safeItems.length;

  const goTo = (i: number) => {
    if (!total) return;
    setIndex((i + total) % total);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // autoplay
  useEffect(() => {
    if (!total) return;

    const clear = () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };

    clear();
    timerRef.current = window.setInterval(() => {
      if (!hoverRef.current) {
        setIndex((v) => (v + 1) % total);
      }
    }, autoPlayMs);

    return clear;
  }, [total, autoPlayMs]);

  // swipe (touch + drag)
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);

  const onStart = (clientX: number) => {
    startX.current = clientX;
    deltaX.current = 0;
  };

  const onMove = (clientX: number) => {
    if (startX.current == null) return;
    deltaX.current = clientX - startX.current;
  };

  const onEnd = () => {
    const dx = deltaX.current;
    startX.current = null;
    deltaX.current = 0;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next();
    else prev();
  };

  if (!total) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/70 backdrop-blur-xl">
        No hay conciertos para mostrar.
      </div>
    );
  }

  const current = safeItems[index];

  return (
    <section
      className="relative"
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
    >
      {/* glows */}
      <div className="pointer-events-none absolute -top-14 left-6 h-44 w-44 rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-0 h-52 w-52 rounded-full bg-white/5 blur-3xl" />

      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_18px_55px_rgba(0,0,0,0.55)]">
        {/* top bar small */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
          <p className="text-xs font-extrabold tracking-[0.35em] text-white/60 uppercase">
            
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              aria-label="Anterior"
              className="h-9 w-9 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center text-white/80"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Siguiente"
              className="h-9 w-9 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center text-white/80"
            >
              ›
            </button>
          </div>
        </div>

        {/* slide */}
        <div
          className="relative select-none"
          onTouchStart={(e) => onStart(e.touches[0].clientX)}
          onTouchMove={(e) => onMove(e.touches[0].clientX)}
          onTouchEnd={onEnd}
          onMouseDown={(e) => onStart(e.clientX)}
          onMouseMove={(e) => {
            if (startX.current != null) onMove(e.clientX);
          }}
          onMouseUp={onEnd}
          onMouseLeave={() => {
            if (startX.current != null) onEnd();
          }}
        >
          {/* más pequeño: 21/9 en desktop, y 16/9 en móvil */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full">
            <img
              src={current.image}
              alt={current.name}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />

            {/* iOS mirror overlays */}
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/55" />

            {/* name (pequeño abajo, sin chip) */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
                <h3 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {current.name}
                </h3>
              </div>
            </div>
          </div>

          {/* dots */}
          <div className="flex items-center justify-center gap-2 px-5 py-3 bg-black/25 border-t border-white/10">
            {safeItems.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir a ${i + 1}`}
                className={[
                  "h-2.5 rounded-full transition-all",
                  i === index
                    ? "w-7 bg-yellow-400/90 shadow-[0_0_18px_rgba(250,204,21,0.55)]"
                    : "w-2.5 bg-white/25 hover:bg-white/40",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
