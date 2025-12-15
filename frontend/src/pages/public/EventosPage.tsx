export default function EventosPage() {
  return (
    <section className="bg-black text-white py-6">
      {/* Glows */}
      <div className="pointer-events-none absolute -top-24 left-10 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-24 right-10 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
            <span className="text-xs font-extrabold tracking-[0.25em] text-white/75 uppercase">
              Eventos
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Próximos eventos
          </h1>
          <p className="mt-4 text-white/70 text-base sm:text-lg leading-relaxed">
            Por el momento no tenemos eventos disponibles para reservar.
          </p>
        </div>

        {/* Card message */}
        <div className="mt-10 mx-auto max-w-2xl">
          <div
            className="
              rounded-3xl
              border border-white/10
              bg-white/5
              p-6 sm:p-7
              backdrop-blur-xl
              shadow-[0_18px_55px_rgba(0,0,0,0.45)]
            "
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-lg font-extrabold">Aún no hay eventos</p>
                <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed">
                  Estamos preparando nuevas fechas y sorpresas. Síguenos para
                  ver anuncios, lineups y links de reserva apenas salgan.
                </p>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://www.instagram.com/bee_concert_club/"
                    target="_blank"
                    rel="noreferrer"
                    className="
                      group inline-flex items-center justify-center
                      rounded-2xl px-5 py-3
                      border border-yellow-300/40
                      bg-white/10
                      backdrop-blur-xl
                      text-sm sm:text-base font-extrabold tracking-wide
                      hover:bg-white/15 hover:border-yellow-300/60
                      transition
                    "
                  >
                    Ver Instagram
                    <span className="ml-2 inline-block transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
