import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
      {/* Video BG */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/videoBee.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />

      {/* Overlays (iOS-ish) */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/60" />

      {/* Content */}
      <div className="relative mx-auto flex h-full max-w-6xl flex-col px-6">
        {/* Top spacing (opcional) */}
        <div className="flex-1" />

        {/* Bottom CTA centered */}
        <div className="pb-10 sm:pb-12 flex items-center justify-center">
            <button
                onClick={() => navigate("/conciertos")}
                className="
                    group inline-flex items-center justify-center gap-3
                    rounded-2xl px-10 py-4
                    text-base sm:text-lg font-extrabold uppercase
                    tracking-[0.22em]
                    text-white
                    border border-yellow-300/90
                    bg-white/12
                    backdrop-blur-xl backdrop-saturate-150
                    shadow-[0_18px_45px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.22)]
                    transition-all duration-200
                    hover:bg-white/18 hover:border-yellow-200/55
                    hover:shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.28),0_0_30px_rgba(253,224,71,0.22)]
                    active:scale-[0.99]
                "
                >
                <span>RESERVAR</span>

                <span
                    className="
                    inline-flex h-9 w-9 items-center justify-center
                    rounded-xl
                    border border-white/18
                    bg-white/10
                    backdrop-blur-xl
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]
                    transition-transform duration-200
                    group-hover:translate-x-1
                    "
                    aria-hidden="true"
                >
                    →
                </span>
            </button>
        </div>
      </div>
    </section>
  );
}
