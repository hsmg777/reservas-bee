import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin() {
  const { token, user, loading, hasRole } = useAuth();

  if (loading) return null; // o loader
  if (!token) return <Navigate to="/admin/login" replace />;
  if (!user || !hasRole(["admin"])) return <Navigate to="/" replace />;

  return <Outlet />;
}
