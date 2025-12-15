import { useState } from "react";

export default function PublicReservaForm({
  disabled,
  onSubmit,
}: {
  disabled?: boolean;
  onSubmit?: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState("1");

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <Field label="Nombre">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
          className="
            mt-1 w-full rounded-2xl
            border border-white/10 bg-white/5
            px-4 py-3 text-sm text-white
            placeholder:text-white/40
            outline-none
            focus:border-yellow-300/40 focus:ring-2 focus:ring-yellow-300/20
            disabled:opacity-60
          "
          placeholder="Tu nombre"
        />
      </Field>

      <Field label="Teléfono">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={disabled}
          className="
            mt-1 w-full rounded-2xl
            border border-white/10 bg-white/5
            px-4 py-3 text-sm text-white
            placeholder:text-white/40
            outline-none
            focus:border-yellow-300/40 focus:ring-2 focus:ring-yellow-300/20
            disabled:opacity-60
          "
          placeholder="0999999999"
        />
      </Field>

      <Field label="Cantidad">
        <select
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          disabled={disabled}
          className="
            mt-1 w-full rounded-2xl
            border border-white/10 bg-white/5
            px-4 py-3 text-sm text-white
            outline-none
            focus:border-yellow-300/40 focus:ring-2 focus:ring-yellow-300/20
            disabled:opacity-60
          "
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </Field>

      <button
        type="submit"
        disabled={disabled}
        className="
          group mt-2 inline-flex items-center justify-center
          rounded-2xl px-6 py-3
          border border-yellow-300/40
          bg-white/10
          backdrop-blur-xl
          text-sm sm:text-base font-extrabold tracking-wide
          hover:bg-white/15 hover:border-yellow-300/60
          transition
          disabled:opacity-60
        "
      >
        Reservar (demo)
        <span className="ml-2 inline-block transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </button>

      <p className="text-xs text-white/50">
        Este formulario aún no guarda nada. Es solo UI.
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
