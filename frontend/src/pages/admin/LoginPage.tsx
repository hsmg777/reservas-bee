import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardPathByRole, useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";


export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);


  useMemo(() => {
    if (user?.role) navigate(getDashboardPathByRole(user.role), { replace: true });
  }, [user?.role]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Ingresa correo y contraseña.");
      return;
    }

    try {
      setLoading(true);
      const u = await login({ email, password });
      navigate(getDashboardPathByRole(u.role), { replace: true });
    } catch (err: any) {
      const msg =
        err?.message === "HTTP_401"
          ? "Correo o contraseña incorrectos."
          : "No se pudo iniciar sesión. Intenta nuevamente.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
    {/* Glows */}
    <div className="pointer-events-none fixed -top-28 left-10 h-80 w-80 rounded-full bg-yellow-400/10 blur-3xl" />
    <div className="pointer-events-none fixed top-28 right-10 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

    <div className="relative mx-auto flex min-h-screen max-w-2xl items-center px-6 py-10">
        {/* UNA SOLA COLUMNA */}
        <div className="w-full space-y-8">
        {/* Info (arriba) */}
        <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
            <span className="text-xs font-extrabold tracking-[0.25em] text-white/70 uppercase">
                Acceso administrativo
            </span>
            </div>

            <div className="mt-6 flex items-center gap-4">
            <img
                src="/images/logoBEE.png"
                alt="Bee Concert Club"
                className="h-14 w-14 object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.45)]"
                draggable={false}
            />
            <div className="leading-tight">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Bee Concert Club
                </h1>
                <p className="mt-1 text-white/70">Panel de administración</p>
            </div>
            </div>
        </div>

        {/* Login card (abajo) */}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl shadow-[0_18px_55px_rgba(0,0,0,0.55)]">
            <h2 className="text-2xl font-extrabold tracking-tight">Iniciar sesión</h2>
            <p className="mt-2 text-sm text-white/70">
            Ingresa tus credenciales para continuar.
            </p>

            {errorMsg && (
            <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {errorMsg}
            </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">
                Correo
                </label>
                <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="admin@beeconcertclub.com"
                className="
                    w-full rounded-2xl border border-white/10
                    bg-black/30 px-4 py-3
                    text-white placeholder:text-white/35
                    outline-none
                    focus:border-yellow-300/40 focus:ring-2 focus:ring-yellow-300/10
                    transition
                "
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">
                    Contraseña
                </label>

                <div className="relative">
                    <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="
                        w-full rounded-2xl border border-white/10
                        bg-black/30 px-4 py-3 pr-12
                        text-white placeholder:text-white/35
                        outline-none
                        focus:border-yellow-300/40 focus:ring-2 focus:ring-yellow-300/10
                        transition
                    "
                    />

                    <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    className="
                        absolute right-2 top-1/2 -translate-y-1/2
                        inline-flex h-10 w-10 items-center justify-center
                        rounded-xl border border-white/10
                        bg-white/5 text-white/70
                        hover:bg-white/10 hover:text-white
                        focus:outline-none focus:ring-2 focus:ring-yellow-300/15
                        transition
                    "
                    >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                    ) : (
                        <Eye className="h-5 w-5" />
                    )}
                    </button>
                </div>
            </div>



            <button
                type="submit"
                disabled={loading}
                className="
                group w-full inline-flex items-center justify-center
                rounded-2xl px-5 py-3
                border border-yellow-300/35
                bg-white/10 backdrop-blur-xl
                font-extrabold tracking-wide
                hover:bg-white/15 hover:border-yellow-300/55
                active:scale-[0.99]
                transition
                disabled:opacity-60 disabled:cursor-not-allowed
                "
            >
                {loading ? "Ingresando..." : "Entrar"}
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-0.5">
                →
                </span>
            </button>

            <div className="pt-2 text-center text-xs text-white/45">
                © 2025 Bee Concert Club
            </div>
            </form>

            <div className="mt-4 text-center text-xs text-white/45">
            ¿Problemas para acceder? Contacta al administrador del sistema.
            </div>
        </div>
        </div>
    </div>
    </div>

  );
}
