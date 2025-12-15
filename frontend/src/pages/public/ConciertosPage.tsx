import ConcertCarousel from "../../components/public/ConcertCarousel";

export default function ConciertosPage() {
  const concerts = [
    { image: "/images/concerts/jhayp.png", name: "Jhay P" },
    { image: "/images/concerts/blanko.jpeg", name: "Blanko" },
    { image: "/images/concerts/cabas.jpeg", name: "Cabas" },
    { image: "/images/concerts/carlosCortez.jpeg", name: "Carlos Cortez" },
    { image: "/images/concerts/factoria.jpeg", name: "Factoría" },
    { image: "/images/concerts/jombriel.jpeg", name: "Jombriel" },
    { image: "/images/concerts/match&Dady.jpeg", name: "Match & Daddy" },
    { image: "/images/concerts/renOG.jpeg", name: "Ren OG" },
    { image: "/images/concerts/rokoyBlasti.jpeg", name: "Roko & Blasti" },
    { image: "/images/concerts/waldokin.jpeg", name: "Waldokinc" },
  ];

  return (
    <div className="bg-black text-white py-6">
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
        <div className="mb-8">
          <p className="text-xs font-extrabold tracking-[0.35em] text-white/60 uppercase">
            Bee Concert Club
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">
            Conciertos
          </h1>
        </div>

        <ConcertCarousel items={concerts} autoPlayMs={3600} />
      </div>
    </div>
  );
}
