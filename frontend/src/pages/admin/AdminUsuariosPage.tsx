import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  Search,
  ShieldCheck,
  RefreshCcw,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { authService } from "../../services/auth";

// Roles backend: "admin" | "user" | "seguridad"
type Role = "admin" | "user" | "seguridad";

type AdminUserDTO = {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at?: string;
};

type Mode = "create" | "edit";

export default function AdminUsuariosPage() {
  const [items, setItems] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  // modal
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selected, setSelected] = useState<AdminUserDTO | null>(null);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter(
      (u) =>
        u.name.toLowerCase().includes(qq) ||
        u.email.toLowerCase().includes(qq) ||
        u.role.toLowerCase().includes(qq)
    );
  }, [items, q]);

  const title = useMemo(
    () => (mode === "create" ? "Crear usuario" : "Editar usuario"),
    [mode]
  );

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function mapUser(u: any): AdminUserDTO {
    return {
      id: Number(u.id),
      name: String(u.name ?? ""),
      email: String(u.email ?? ""),
      role: (u.role ?? "user") as Role,
      is_active: Boolean(u.is_active ?? true),
      created_at: u.created_at ?? u.createdAt ?? undefined,
    };
  }

  function parseErr(e: any) {
    const msg = e?.message || "Ocurrió un error";
    // apiRequest ya trae message del backend si existe
    return msg;
  }

  async function refresh() {
    setLoading(true);
        try {
            const res = await authService.listUsers();

            const list =
            Array.isArray((res as any)?.items) ? (res as any).items :
            Array.isArray((res as any)?.users) ? (res as any).users :
            Array.isArray(res) ? (res as any) :
            [];

            setItems(list.map(mapUser));
        } catch (e: any) {
            Swal.fire("Error", parseErr(e), "error");
        } finally {
            setLoading(false);
        }
    }


  function openCreate() {
    setMode("create");
    setSelected(null);
    setOpen(true);
  }

  function openEdit(u: AdminUserDTO) {
    // OJO: Aún NO tenemos endpoint update, lo dejamos como UI demo.
    setMode("edit");
    setSelected(u);
    setOpen(true);
  }

  async function onDelete(u: AdminUserDTO) {
    const res = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: `Se eliminará: ${u.name} (${u.email})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!res.isConfirmed) return;

    try {
      await authService.deleteUser(u.id);
      setItems((prev) => prev.filter((x) => x.id !== u.id));
      Swal.fire("Eliminado", "Usuario eliminado correctamente", "success");
    } catch (e: any) {
      Swal.fire("Error", parseErr(e), "error");
    }
  }

  async function onSubmit(payload: {
    name: string;
    email: string;
    password?: string;
    role: Role;
    is_active: boolean;
  }) {
    // ✅ create real (register admin)
    if (mode === "create") {
      try {
        const res = await authService.register({
          name: payload.name,
          email: payload.email,
          password: payload.password || "",
          role: payload.role,
          // is_active: en tu backend register aún no lo usas.
          // Si quieres manejarlo, creamos endpoint update o lo soportamos en register.
        });

        // soporte: { user: {...} } o { message, user }
        const created = (res as any)?.user ? (res as any).user : res;
        const mapped = mapUser(created);

        setItems((prev) => [mapped, ...prev]);
        Swal.fire("Listo", "Usuario creado correctamente", "success");
        setOpen(false);
        return;
      } catch (e: any) {
        const msg = parseErr(e);
        if (msg === "EMAIL_EXISTS") {
          Swal.fire("Error", "Ese correo ya existe.", "error");
        } else if (msg === "FORBIDDEN") {
          Swal.fire("Error", "No tienes permisos (solo admin).", "error");
        } else {
          Swal.fire("Error", msg, "error");
        }
        return;
      }
    }

    // ✳️ edit (demo, porque no hay endpoint update aún)
    if (mode === "edit" && selected) {
      setItems((prev) =>
        prev.map((x) =>
          x.id === selected.id
            ? {
                ...x,
                name: payload.name,
                email: payload.email,
                role: payload.role,
                is_active: payload.is_active,
              }
            : x
        )
      );
      Swal.fire("Listo", "Usuario actualizado (demo)", "info");
      setOpen(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Soft background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-yellow-300/25 blur-3xl" />
        <div className="absolute top-10 -right-56 h-[560px] w-[560px] rounded-full bg-sky-200/35 blur-3xl" />
      </div>

      <div className="relative">
        {/* Topbar */}
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-extrabold tracking-tight">
                  Admin · Usuarios
                </p>
                <p className="text-xs text-slate-500">Bee Concert Club</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                disabled={loading}
                title="Refrescar"
              >
                <RefreshCcw className="h-4 w-4" />
                {loading ? "..." : "Refrescar"}
              </button>

              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <UserPlus className="h-4 w-4" />
                Nuevo usuario
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Usuarios
              </h1>
              <p className="mt-2 text-slate-600">
                Crea usuarios y asigna roles (admin / seguridad / user).
              </p>
            </div>

            <NavLink
              to="/admin"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Volver al panel
            </NavLink>
          </div>

          {/* Search */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-[0_14px_35px_rgba(2,6,23,0.08)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white">
                  <Search className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold">Buscar</p>
                  <p className="text-xs text-slate-500">
                    Nombre, correo o rol
                  </p>
                </div>
              </div>

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ej: seguridad, admin@..."
                className="w-full sm:w-[360px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          {/* List */}
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-[0_14px_35px_rgba(2,6,23,0.08)]">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <p className="font-extrabold">Listado</p>
              <span className="text-xs text-slate-500">
                {loading ? "Cargando..." : `${filtered.length} usuario(s)`}
              </span>
            </div>

            <div className="p-6">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
                  {loading ? "Cargando..." : "No hay resultados."}
                </div>
              ) : (
                <div className="grid gap-4">
                  {filtered.map((u) => (
                    <div
                      key={u.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold truncate">{u.name}</p>
                          <RoleBadge role={u.role} />
                          {!u.is_active && (
                            <span className="text-xs font-bold px-2 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                              inactivo
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600 truncate">
                          {u.email}
                        </p>
                        <div className="mt-2 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                          <span className="inline-flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            permisos por rol
                          </span>
                          <span className="font-mono">id: {u.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onDelete(u)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 text-xs text-slate-500">
            © 2025 Bee Concert Club · Admin
          </div>
        </main>

        {open && (
          <UserModal
            title={title}
            mode={mode}
            initial={selected}
            onClose={() => setOpen(false)}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- UI bits ---------- */

function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, string> = {
    admin: "bg-slate-900 text-white border-slate-900",
    seguridad: "bg-yellow-50 text-yellow-800 border-yellow-200",
    user: "bg-sky-50 text-sky-800 border-sky-200",
  };

  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${map[role]}`}>
      {role}
    </span>
  );
}

/* ---------- Modal ---------- */

function UserModal({
  title,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  title: string;
  mode: Mode;
  initial: AdminUserDTO | null;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    email: string;
    password?: string;
    role: Role;
    is_active: boolean;
  }) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(initial?.role ?? "user");
  const [isActive, setIsActive] = useState<boolean>(initial?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (name.trim().length < 2) {
      Swal.fire("Validación", "Nombre obligatorio (min 2).", "warning");
      return;
    }
    if (!email.trim().includes("@")) {
      Swal.fire("Validación", "Correo no válido.", "warning");
      return;
    }
    if (mode === "create" && password.trim().length < 6) {
      Swal.fire("Validación", "Contraseña (min 6).", "warning");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim() ? password.trim() : undefined,
        role,
        is_active: isActive,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-2xl rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(2,6,23,0.25)]">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <p className="font-extrabold">{title}</p>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>

          <div className="p-6 grid gap-4">
            <div>
              <label className="text-sm font-bold">Nombre</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Nombre..."
              />
            </div>

            <div>
              <label className="text-sm font-bold">Correo</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="correo@..."
              />
            </div>

            {mode === "create" && (
              <div>
                <label className="text-sm font-bold">Contraseña</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="******"
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-bold">Rol</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="admin">admin</option>
                  <option value="seguridad">seguridad</option>
                  <option value="user">user</option>
                </select>
              </div>

              <div className="flex items-end gap-3">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Activo
                </label>
              </div>
            </div>

            {mode === "edit" && (
              <div className="text-xs text-slate-500">
                Editar aún es <b>demo</b>. Si quieres, hacemos endpoint PUT
                <span className="font-mono"> /api/auth/users/:id</span> para actualizar.
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              onClick={submit}
              disabled={saving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
