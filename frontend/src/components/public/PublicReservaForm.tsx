import { useState } from "react";
import type { ReservationCreatePayload } from "../../types/reservation";

export default function PublicReservaForm({
  disabled,
  onSubmit,
}: {
  disabled?: boolean;
  onSubmit?: (payload: ReservationCreatePayload) => Promise<void> | void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled || submitting) return;

    // validación simple (frontend)
    if (firstName.trim().length < 2 || lastName.trim().length < 2) return;
    if (!email.includes("@")) return;
    if (phone.trim().length < 7) return;

    setSubmitting(true);
    try {
      await onSubmit?.({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        instagram: instagram.trim() ? instagram.trim() : null,
      });

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setInstagram("");
      
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <Field label="Nombre">
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={disabled || submitting}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-yellow-300/40 focus:ring-2 focus:ring-yellow-300/20 disabled:opacity-60"
          placeholder="Tu nombre"
          required
        />
      </Field>

      <Field label="Apellido">
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={disabled || submitting}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-yellow-300/40 focus:ring-2 focus:ring-yellow-300/20 disabled:opacity-60"
          placeholder="Tu apellido"
          required
        />
      </Field>

      <Field label="Correo electrónico">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled || submitting}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-yellow-300/40 focus:ring-2 focus:ring-yellow-300/20 disabled:opacity-60"
          placeholder="tucorreo@gmail.com"
          required
        />
      </Field>

      <Field label="Celular">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={disabled || submitting}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-yellow-300/40 focus:ring-2 focus:ring-yellow-300/20 disabled:opacity-60"
          placeholder="0999999999"
          required
        />
      </Field>

      <Field label="Instagram">
        <input
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          disabled={disabled || submitting}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-yellow-300/40 focus:ring-2 focus:ring-yellow-300/20 disabled:opacity-60"
          placeholder="@tu_usuario"
          required
        />
      </Field>

      <button
        type="submit"
        disabled={disabled || submitting}
        className="group mt-2 inline-flex items-center justify-center rounded-2xl px-6 py-3 border border-yellow-300/40 bg-white/10 backdrop-blur-xl text-sm sm:text-base font-extrabold tracking-wide hover:bg-white/15 hover:border-yellow-300/60 transition disabled:opacity-60"
      >
        {submitting ? "Reservando..." : "Reservar"}
        <span className="ml-2 inline-block transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </button>

      <p className="text-xs text-white/50">
        Te llegará un correo con tu QR (y también lo verás aquí).
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-extrabold text-white">{label}</label>
      {children}
    </div>
  );
}
