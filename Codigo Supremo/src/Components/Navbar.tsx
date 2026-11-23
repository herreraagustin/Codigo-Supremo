
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

type NavbarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isLogged: boolean;
  onLogout: () => void;
};

const links = [
  { to: "/home", label: "Inicio" },
  { to: "/planes", label: "Planes" },
];

export default function Navbar({
  searchTerm,
  onSearchChange,
  isLogged,
  onLogout,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold transition-colors ${
      isActive ? "text-white" : "text-slate-300 hover:text-white"
    }`;

  const cerrarMenu = () => setMenuOpen(false);

  const mostrarBuscador =
    isLogged && location.pathname === "/home";

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0b1220]/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo: Home con sesión iniciada, bienvenida sin sesión */}
        <Link
          to={isLogged ? "/home" : "/"}
          className="flex items-center gap-2 text-lg font-bold text-white"
          onClick={cerrarMenu}
        >
          <span
            className="h-2 w-6 rounded-full bg-cyan-400"
            aria-hidden="true"
          />
          CineRolling
        </Link>

        {/* Navegación: solo con sesión iniciada */}
        {isLogged && (
          <div className="ml-4 hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Buscador: solo con sesión y en Home */}
        {mostrarBuscador && (
          <div className="mx-auto hidden w-full max-w-md md:block">
            <label className="relative block">
              <span className="sr-only">
                Buscar películas por nombre
              </span>

              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar películas por nombre..."
                className="w-full rounded-full bg-[#151d2e] py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 outline-none ring-1 ring-transparent transition focus:ring-blue-500"
              />
            </label>
          </div>
        )}

        {/* Acciones de escritorio */}
        <div className="ml-auto hidden items-center gap-3 md:flex">
          {isLogged ? (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
            >
              Cerrar sesión
            </button>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-full bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
              >
                Registrarse
              </Link>

              <Link
                to="/login"
                className="rounded-full border border-white/10 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#151d2e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
              >
                Iniciar sesión
              </Link>
            </>
          )}
        </div>

        {/* Avatar: solo con sesión iniciada */}
        {isLogged && (
          <div
            className="hidden h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 ring-2 ring-white/10 md:block"
            aria-hidden="true"
          />
        )}

        {/* Botón hamburguesa */}
        <button
          type="button"
          className="ml-auto rounded-md p-2 text-slate-300 hover:text-white md:hidden"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {menuOpen ? (
              <path d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="space-y-4 border-t border-white/5 px-4 py-4 md:hidden">
          {isLogged ? (
            <>
              {mostrarBuscador && (
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar películas por nombre..."
                  className="w-full rounded-full bg-[#151d2e] px-4 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}

              <div className="flex flex-col gap-3">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={linkClass}
                    onClick={cerrarMenu}
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  cerrarMenu();
                }}
                className="w-full rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/register"
                onClick={cerrarMenu}
                className="block w-full rounded-full bg-blue-500 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-400"
              >
                Registrarse
              </Link>

              <Link
                to="/login"
                onClick={cerrarMenu}
                className="block w-full rounded-full border border-white/10 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#151d2e]"
              >
                Iniciar sesión
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
