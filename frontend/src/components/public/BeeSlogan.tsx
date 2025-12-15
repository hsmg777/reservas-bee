export default function BeeSlogan() {
  return (
    <section className="relative w-full overflow-hidden bg-black py-16 sm:py-20">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-yellow-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-10 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs sm:text-sm tracking-[0.35em] uppercase text-white/60">
            Bee Concert Club
          </p>

          <h2
            className="
              mt-5
              text-4xl sm:text-6xl lg:text-7xl
              font-extrabold uppercase
              tracking-[0.12em]
              text-white
              drop-shadow-[0_0_18px_rgba(250,204,21,0.30)]
            "
            style={{
              textShadow:
                "0 0 16px rgba(250,204,21,0.28), 0 0 40px rgba(250,204,21,0.18)",
            }}
          >
            THE ONLY PLACE
            <br className="hidden sm:block" />
            YOU WANT TO{" "}
            <span
              className="text-yellow-300"
              style={{
                textShadow:
                  "0 0 18px rgba(250,204,21,0.55), 0 0 60px rgba(250,204,21,0.25)",
              }}
            >
              BEE
            </span>
          </h2>

          {/* Shine line */}
          <div className="mx-auto mt-8 h-px w-48 bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent" />

          <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base text-white/70">
            Música, fiesta y shots! Ven a vivir la mejor experiencia.
          </p>
        </div>
      </div>
    </section>
  );
}
