
import { Link } from "react-router-dom";

export const Admin = () => {
  return (
    <main className="min-h-screen bg-[#070b14] p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-6 inline-block text-blue-400 hover:text-blue-300"
        >
          ← Volver al inicio
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl font-bold md:text-4xl">
            Panel de Administración
          </h1>

          <p className="mt-3 text-slate-400">
            Seleccioná una sección para administrar CineRolling.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/admin/peliculas"
            className="group rounded-xl border border-slate-700 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500 hover:bg-slate-800"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M7 3v18M17 3v18M3 7h4M3 12h4M3 17h4M17 7h4M17 12h4M17 17h4" />
              </svg>
            </div>

            <h2 className="text-xl font-bold group-hover:text-blue-400">
              Películas
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Consultá y administrá las películas del catálogo.
            </p>

            <p className="mt-5 text-sm font-semibold text-blue-400">
              Ir a películas →
            </p>
          </Link>

          <Link
            to="/admin/series"
            className="group rounded-xl border border-slate-700 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-purple-500 hover:bg-slate-800"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="m10 9 5 3-5 3z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold group-hover:text-purple-400">
              Series
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Consultá y administrá las series del catálogo.
            </p>

            <p className="mt-5 text-sm font-semibold text-purple-400">
              Ir a series →
            </p>
          </Link>

          <Link
            to="/admin/usuarios"
            className="group rounded-xl border border-slate-700 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-emerald-500 hover:bg-slate-800"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>

            <h2 className="text-xl font-bold group-hover:text-emerald-400">
              Usuarios
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Consultá y administrá los usuarios registrados.
            </p>

            <p className="mt-5 text-sm font-semibold text-emerald-400">
              Ir a usuarios →
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
};
