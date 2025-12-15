import { NavLink } from "react-router-dom";

export default function NosotrosPage() {
  return (
    <section className="bg-black text-white py-6">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-24 left-10 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-24 right-10 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-10">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
            <span className="text-xs font-extrabold tracking-[0.25em] text-white/75 uppercase">
              Nosotros
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Bee Concert Club
          </h1>

          <p className="mt-4 text-white/70 text-base sm:text-lg leading-relaxed">
            En Bee Concert Club, la fiesta no se explica…{" "}
            <span className="text-white font-semibold">se vive</span>. Somos el
            punto donde la música, la energía y la vibra se conectan. Aquí, cada
            noche es movimiento, luces, shots y una atmósfera que te atrapa
            desde que entras.
            <br />
            <br />
            Traemos artistas nacionales e internacionales que garantizan lo que
            vienes buscando: un show que prende la noche, un público que vibra
            contigo y una pista que no descansa.
          </p>
        </div>

        {/* Row: Diferentes + Info rápida */}
        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          {/* Left: Diferentes */}
          <div className="lg:col-span-7">
            <Card>
              <h3 className="text-sm font-extrabold tracking-[0.25em] text-white/80 uppercase">
                Lo que nos hace diferentes
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Bullet
                  title="Artistas & DJs"
                  desc="Lineups que prenden la noche de verdad."
                />
                <Bullet
                  title="Experiencias temáticas"
                  desc="Eventos con concepto y vibra única."
                />
                <Bullet
                  title="Ambiente premium"
                  desc="Luces, sonido y energía a otro nivel."
                />
                <Bullet
                  title="Reservas rápidas"
                  desc="Seguras y sin complicarte."
                />
              </div>
            </Card>
          </div>

          {/* Right: Info rápida */}
          <div className="lg:col-span-5">
            <Card>
              <h3 className="text-sm font-extrabold tracking-[0.25em] text-white/80 uppercase">
                Info rápida
              </h3>

              <div className="mt-4 grid gap-3">
                <InfoRow label="Ubicación" value="Plaza Mayor" />
                <InfoRow label="Horario" value="21h15 – 04h00" />
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm text-white/70 leading-relaxed">
                  “THE ONLY PLACE YOU WANT TO{" "}
                  <span className="text-yellow-300 font-extrabold">BEE</span>.”
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Buttons centered */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <NavLink
            to="/conciertos"
            className="
              group inline-flex items-center justify-center
              rounded-2xl px-6 py-3
              border border-yellow-300/40
              bg-white/10
              backdrop-blur-xl
              text-sm sm:text-base font-extrabold tracking-wide
              hover:bg-white/15 hover:border-yellow-300/60
              transition
            "
          >
            Ver conciertos
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </NavLink>

          <a
            href="https://www.instagram.com/bee_concert_club/"
            target="_blank"
            rel="noreferrer"
            className="
              group inline-flex items-center justify-center
              rounded-2xl px-6 py-3
              border border-white/10
              bg-white/5
              backdrop-blur-xl
              text-sm sm:text-base font-semibold text-white/80
              hover:bg-white/10 hover:text-white
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

      {/* Full width map */}
      <div className="px-4 sm:px-6 pb-14">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_18px_55px_rgba(0,0,0,0.45)] overflow-hidden">
            <div className="relative h-[320px] sm:h-[420px] w-full">
              <iframe
                title="Bee Concert Club - Ubicación"
                className="absolute inset-0 h-full w-full"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.223569548917!2d-78.49731802561078!3d-0.18790279971568188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x73017b1ec3a99f86!2sBEE%20CONCERT%20CLUB!5e0!3m2!1ses-419!2sec!4v1700000000000!5m2!1ses-419!2sec"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="px-5 py-4 border-t border-white/10">
              <p className="text-xs sm:text-sm text-white/60">
                Tip: abre el mapa para rutas y tiempos de llegada.
              </p>
            </div>
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

function Bullet({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="font-extrabold text-white">{title}</p>
      <p className="mt-1 text-sm text-white/65 leading-relaxed">{desc}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm text-white/65">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
