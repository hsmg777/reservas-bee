import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import PublicLayout from "./components/public/PublicLayout";

import HomePage from "./pages/public/HomePage";
import NosotrosPage from "./pages/public/NosotrosPage";
import EventosPage from "./pages/public/EventosPage";
import ConciertosPage from "./pages/public/ConciertosPage";
import PoliticasPage from "./pages/public/PoliticasPage";
import EventoPublicoPage from "./pages/public/EventoPublicoPage";

import LoginPage from "./pages/admin/LoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminEventosPage from "./pages/admin/AdminEventosPage";
import AdminUsuariosPage from "./pages/admin/AdminUsuariosPage";

import SecurityScanPage from "./pages/security/SecurityScanPage";

import RequireAdmin from "./routes/RequireAdmin";
import RequireRole from "./routes/RequireRole";

import AdminReservasPage from "./pages/admin/AdminReservasPage";


export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/conciertos" element={<ConciertosPage />} />
          <Route path="/politicas" element={<PoliticasPage />} />
          <Route path="/evento/:publicCode" element={<EventoPublicoPage />} />
        </Route>

        {/* AUTH */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* ADMIN ONLY */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/eventos" element={<AdminEventosPage />} />
          <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
           <Route path="/admin/reservas" element={<AdminReservasPage />} /> 
        </Route>

        {/* SEGURIDAD (admin también puede entrar) */}
        <Route element={<RequireRole roles={["seguridad"]} />}>
          <Route path="/seguridad" element={<SecurityScanPage />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
