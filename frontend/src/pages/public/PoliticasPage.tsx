export default function PoliticasPage() {
  const policiesLeft = [
    {
      title: "Edad mínima",
      desc: "Solo se permite la entrada a mayores de edad con identificación válida.",
    },
    {
      title: "Registro / reserva",
      desc: "Tu registro o reserva no garantiza el ingreso.",
    },
    {
      title: "No drogas",
      desc: "Prohibido consumir o portar sustancias ilegales.",
    },
    {
      title: "Comportamiento",
      desc: "Mantén un comportamiento respetuoso, sin agresiones ni acoso.",
    },
    {
      title: "Consumo responsable",
      desc: "No se servirá alcohol a personas en estado etílico.",
    },
    {
      title: "Respeto e inclusión",
      desc: "No se tolera discriminación; promovemos un ambiente inclusivo.",
    },
  ];

  const policiesRight = [
    {
      title: "Derecho de admisión",
      desc: "Nos reservamos el derecho de admisión.",
    },
    {
      title: "Seguridad",
      desc: "Control de acceso y revisión de pertenencias al ingresar.",
    },
    {
      title: "Horarios",
      desc: "Jueves–Sábado de 21:15h a 04:00h.",
    },
    {
      title: "Vestimenta",
      desc: "Vestimenta semiformal, no prendas deportivas.",
    },
    {
      title: "Entradas no reembolsables",
      desc: "No se reembolsan entradas excepto por cancelaciones.",
    },
  ];

  return (
    <section className="bg-black text-white py-16">
      {/* Background glows */}
      <div className="pointer-events-none absolute -top-24 left-10 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-24 right-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,196,0,0.08),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-6 py-14 sm:py-16">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-extrabold tracking-[0.35em] text-white/60 uppercase">
            Bee Concert Club
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">
            Políticas
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/70 leading-relaxed">
            Estas normas nos ayudan a mantener una experiencia segura, respetuosa
            y con la mejor vibra para todos.
          </p>
        </div>

        {/* Content grid */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <PolicyCard title="Normas generales" items={policiesLeft} />
          <PolicyCard title="Reglas del club" items={policiesRight} />
        </div>
      </div>
    </section>
  );
}

function PolicyCard({
  title,
  items,
}: {
  title: string;
  items: { title: string; desc: string }[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      {/* Card header */}
      <div className="relative px-6 py-5 border-b border-white/10">
        <div className="pointer-events-none absolute -top-10 -left-10 h-28 w-44 rounded-full bg-white/10 blur-2xl" />
        <h2 className="relative text-sm font-extrabold tracking-[0.3em] text-white/80 uppercase">
          {title}
        </h2>
      </div>

      {/* List */}
      <ul className="px-6 py-6 grid gap-3">
        {items.map((it) => (
          <li
            key={it.title}
            className="
              group rounded-2xl border border-white/10 bg-white/5
              px-4 py-4 transition
              hover:bg-white/10
            "
          >
            <div className="flex items-start gap-3">
              {/* Glow bullet */}
              <span
                className="
                  mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full
                  bg-yellow-400/80
                  shadow-[0_0_18px_rgba(250,204,21,0.55)]
                "
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-base font-extrabold text-white/95">
                  {it.title}
                </p>
                <p className="mt-1 text-sm text-white/70 leading-relaxed">
                  {it.desc}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
