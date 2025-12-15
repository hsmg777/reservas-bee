import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, getDashboardPathByRole } from "../context/AuthContext";
import type { UserRole } from "../types/auth";

export default function RequireRole({ roles }: { roles: UserRole[] }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return null; // o loader

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={getDashboardPathByRole(user.role)} replace />;
  }

  return <Outlet />;
}
