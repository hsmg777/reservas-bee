import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import PublicLayout from "./components/public/PublicLayout";
import HomePage from "./pages/public/HomePage";
import NosotrosPage from "./pages/public/NosotrosPage";
import EventosPage from "./pages/public/EventosPage";
import ConciertosPage from "./pages/public/ConciertosPage";
import PoliticasPage from "./pages/public/PoliticasPage";

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
        </Route>

        {/* ADMIN (luego lo hacemos) */}
        <Route path="/admin/*" element={<div>Admin: próximamente</div>} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
