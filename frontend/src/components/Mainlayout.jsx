import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar />

      <main className="min-w-0 w-full flex-1 p-3 sm:p-5 lg:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
