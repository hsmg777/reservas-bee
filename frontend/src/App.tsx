import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import PublicLayout from "./components/public/PublicLayout";
import HomePage from "./pages/public/HomePage";
import NosotrosPage from "./pages/public/NosotrosPage";
import EventosPage from "./pages/public/EventosPage";
import ConciertosPage from "./pages/public/ConciertosPage";
import PoliticasPage from "./pages/public/PoliticasPage";
import LoginPage from "./pages/admin/LoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminEventosPage from "./pages/admin/AdminEventosPage";
import RequireAdmin from "./routes/RequireAdmin";
import EventoPublicoPage from "./pages/public/EventoPublicoPage";

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
        <Route path="/admin/login" element={<LoginPage />} />

        {/* ADMIN (luego lo hacemos) */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/eventos" element={<AdminEventosPage />} />
        </Route>
        

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
