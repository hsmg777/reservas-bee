import { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import { NavLink } from "react-router-dom";
import { ShieldCheck, RefreshCcw, LogOut } from "lucide-react";
import QrScanner from "qr-scanner";
import { EventAccessService } from "../../services/event-access.service";
import type { AccessCheckResponseDTO } from "../../types/event-access";
import { useAuth } from "../../context/AuthContext";
import { ReservationsService } from "../../services/reservations.service";
import type { CheckinResponseDTO } from "../../types/reservation";

QrScanner.WORKER_PATH = new URL(
  "qr-scanner/qr-scanner-worker.min.js",
  import.meta.url
).toString();

export default function SecurityScanPage() {
  const { user, logout } = useAuth();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  // Locks reales
  const processingRef = useRef(false);
  const mountedRef = useRef(true);
  const lastScanRef = useRef<{ code: string; ts: number }>({ code: "", ts: 0 });

  const [busy, setBusy] = useState(false);
  const [lastCode, setLastCode] = useState("");
  const [camError, setCamError] = useState<string | null>(null);

  const displayName = useMemo(() => user?.name?.trim() || "Seguridad", [user]);

  type ScanTarget =
  | { kind: "reservation"; code: string }
  | { kind: "access"; code: string };

  function parseScannedTarget(raw: string): ScanTarget | null {
    const s = (raw || "").trim();
    if (!s) return null;

    if (s.startsWith("http://") || s.startsWith("https://")) {
      try {
        const url = new URL(s);
        const parts = url.pathname.split("/").filter(Boolean).map(p => p.toLowerCase());

        const idxAccess = parts.findIndex((p) => p === "access");
        if (idxAccess >= 0 && parts[idxAccess + 1]) {
          const rawParts = url.pathname.split("/").filter(Boolean);
          return { kind: "access", code: rawParts[idxAccess + 1] };
        }

        // ✅ RESERVA: /checkin/:reservation_code
        const idxCheckin = parts.findIndex((p) => p === "checkin");
        if (idxCheckin >= 0 && parts[idxCheckin + 1]) {
          const rawParts = url.pathname.split("/").filter(Boolean);
          return { kind: "reservation", code: rawParts[idxCheckin + 1] };
        }

        const rawParts = url.pathname.split("/").filter(Boolean);
        const last = rawParts[rawParts.length - 1];
        if (!last) return null;

        return { kind: "reservation", code: last };
      } catch {
        return null;
      }
    }

    // Si solo viene texto (sin URL): asumimos reserva
    return { kind: "reservation", code: s };
  }


  async function stopScanner() {
    if (!scannerRef.current) return;
    try {
      await scannerRef.current.stop();
    } catch {}
  }

  async function startScanner() {
    if (!mountedRef.current) return;
    setCamError(null);

    const video = videoRef.current;
    if (!video) return;

    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      scannerRef.current.destroy();
      scannerRef.current = null;
    }

    try {
      const scanner = new QrScanner(
        video,
        (result) => {
          const text =
            typeof result === "string" ? result : (result as any)?.data;
          if (!text) return;
          void handleCode(text);
        },
        {
          preferredCamera: "environment",
          maxScansPerSecond: 2,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      scannerRef.current = scanner;
      await scanner.start();
    } catch (e: any) {
      setCamError(
        e?.message ||
          "No se pudo acceder a la cámara. Revisa permisos del navegador."
      );
    }
  }

  async function handleCode(raw: string) {
    const target = parseScannedTarget(raw);
    if (!target) return;

    const code = target.code;


    const now = Date.now();

    // lock duro
    if (processingRef.current) return;

    // cooldown mismo código
    if (
      lastScanRef.current.code === code &&
      now - lastScanRef.current.ts < 2500
    ) {
      return;
    }

    processingRef.current = true;
    lastScanRef.current = { code, ts: now };

    setLastCode(code);
    setBusy(true);

    // pausa cámara mientras validas
    await stopScanner();

    try {
      if (target.kind === "reservation") {
        const res = (await ReservationsService.checkin(code)) as CheckinResponseDTO;

        if (res.ok) {
          const r = res.reservation;
          const fullName = r ? `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() : "—";

          await Swal.fire({
            icon: "success",
            title: "✅ Aprobado",
            html: `
              <div style="text-align:left">
                <div><b>Persona:</b> ${escapeHtml(fullName)}</div>
                <div><b>Código:</b> <span style="font-family:monospace">${escapeHtml(code)}</span></div>
                <div><b>Mensaje:</b> ${escapeHtml(res.message || "OK")}</div>
              </div>
            `,
            confirmButtonText: "Listo",
            allowOutsideClick: false,
          });
        } else {
          const msg = res.message || "REJECTED";
          const title =
            msg === "ALREADY_USED"
              ? "⚠️ Ya usado"
              : msg === "NOT_FOUND"
              ? "❌ No encontrado"
              : "❌ Rechazado";

          const icon = msg === "ALREADY_USED" ? "warning" : "error";

          await Swal.fire({
            icon,
            title,
            html: `
              <div style="text-align:left">
                <div><b>Código:</b> <span style="font-family:monospace">${escapeHtml(code)}</span></div>
                <div style="margin-top:6px;color:#666">${escapeHtml(msg)}</div>
              </div>
            `,
            confirmButtonText: "Entendido",
            allowOutsideClick: false,
          });
        }

        return; // ✅ importante: no continúa al bloque access
      }

      // ✅ QR ILIMITADO (ACCESS)
      const res = (await EventAccessService.check(code)) as AccessCheckResponseDTO;

      if (res.ok) {
        const ev = res.event;
        const acc = res.access;

        await Swal.fire({
          icon: "success",
          title: "✅ Bienvenido",
          html: `
            <div style="text-align:left">
              <div><b>Evento:</b> ${escapeHtml(ev?.name ?? "—")}</div>
              <div><b>Estado:</b> ${escapeHtml(ev?.status ?? "—")}</div>
              <div><b>Accesos:</b> ${escapeHtml(String(acc?.scan_count ?? 0))}</div>
              <div><b>Código:</b> <span style="font-family:monospace">${escapeHtml(code)}</span></div>
            </div>
          `,
          confirmButtonText: "Listo",
          allowOutsideClick: false,
        });
      } else {
        const msg = res.message || "REJECTED";
        const title =
          msg === "EVENT_NOT_ACTIVE"
            ? "⛔ Evento no activo"
            : msg === "CODE_DISABLED"
            ? "⛔ QR deshabilitado"
            : msg === "NOT_FOUND"
            ? "❌ No encontrado"
            : "❌ Rechazado";

        await Swal.fire({
          icon: "error",
          title,
          html: `
            <div style="text-align:left">
              <div><b>Código:</b> <span style="font-family:monospace">${escapeHtml(code)}</span></div>
              <div style="margin-top:6px;color:#666">${escapeHtml(msg)}</div>
              ${
                res.event?.name
                  ? `<div style="margin-top:10px"><b>Evento:</b> ${escapeHtml(res.event.name)}</div>`
                  : ""
              }
            </div>
          `,
          confirmButtonText: "Entendido",
          allowOutsideClick: false,
        });
      }
    } catch (e: any) {
      await Swal.fire("Error", e?.message ?? "No se pudo validar el QR", "error");

    } finally {
      setBusy(false);

      window.setTimeout(() => {
        if (!mountedRef.current) return;
        processingRef.current = false;
        void startScanner();
      }, 600);

      window.setTimeout(() => {
        if (!mountedRef.current) return;
        setLastCode("");
      }, 1500);
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    void startScanner();

    return () => {
      mountedRef.current = false;
      void stopScanner();
      if (scannerRef.current) {
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-extrabold tracking-tight">
                Seguridad · Check-in
              </p>
              <p className="text-xs text-slate-500">{displayName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Inicio
            </NavLink>

            <button
              onClick={() => void startScanner()}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
              title="Reiniciar cámara"
            >
              <RefreshCcw className="h-4 w-4" />
              Reiniciar
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Escanear QR
          </h1>
          <p className="mt-2 text-slate-600">
            Apunta la cámara al código para validar el ingreso.
          </p>
        </div>

        <div className="mt-8 mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="font-extrabold">Cámara</p>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full border ${
                busy
                  ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              {busy ? "validando..." : "listo"}
            </span>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-black">
            <video
              ref={videoRef}
              className="w-full h-[420px] object-cover"
              muted
              playsInline
            />
          </div>

          {camError && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {camError}
            </div>
          )}

          <div className="mt-4 text-xs text-slate-500 text-center">
            Último código: <span className="font-mono">{lastCode || "—"}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function escapeHtml(s: string) {
  return (s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
