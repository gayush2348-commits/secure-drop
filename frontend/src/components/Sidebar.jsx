import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigation = [
  { name: "Dashboard", path: "/" },
  { name: "My Documents", path: "/documents" },
  { name: "Upload", path: "/upload" },
  { name: "Profile", path: "/profile" },
];

function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <>
      {/* Mobile navbar */}
      <header className="relative z-20 flex w-full items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <NavLink
          to="/"
          onClick={() => setMobileOpen(false)}
          className="text-xl font-bold text-blue-600"
        >
          SecureDrop
        </NavLink>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          className="rounded-lg border border-slate-200 p-2 text-slate-700"
        >
          {mobileOpen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m6 6 12 12M18 6 6 18"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav className="absolute left-0 right-0 top-[57px] z-30 border-b border-slate-200 bg-white p-4 shadow-lg md:hidden">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() => setMobileOpen(false)}
                className={linkClass}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white p-6 md:block">
        <NavLink
          to="/"
          className="mb-10 block text-2xl font-bold text-blue-600"
        >
          SecureDrop
        </NavLink>

        <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={linkClass}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
        {user?.role === "admin" && <NavLink to="/admin">Admin Panel</NavLink>}
      </aside>
    </>
  );
}

export default Sidebar;
