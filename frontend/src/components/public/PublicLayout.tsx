import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

export default function PublicLayout() {
  return (
    <div>
      <PublicNavbar />
      <main >
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
