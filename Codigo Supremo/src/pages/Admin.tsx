
import { Link } from "react-router-dom";

export const Admin = () => {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-white sm:px-6 sm:py-8 md:px-10 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        {/* Volver al inicio */}
        <Link
          to="/"
          className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-blue-400 transition hover:text-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400 sm:mb-8 sm:text-base"
        >
          <span aria-hidden="true">←</span>
          Volver al inicio
        </Link>

        {/* Encabezado */}
        <header className="mb-8 sm:mb-10 md:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 sm:text-sm">
            CineRolling
          </p>

          <h1 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl lg:text-5xl">
            Panel de Administración
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Seleccioná una sección para administrar películas, series y
            usuarios de CineRolling.
          </p>
        </header>

        {/* Secciones de administración */}
        <section
          aria-label="Secciones de administración"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
        >
          {/* Películas */}
          <Link
            to="/admin/peliculas"
            className="group flex min-h-56 flex-col rounded-2xl border border-slate-700 bg-slate-900/80 p-5 transition duration-200 hover:-translate-y-1 hover:border-blue-500 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400 sm:min-h-60 sm:p-6"
          >
            <div className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 transition group-hover:bg-blue-500/25 sm:h-14 sm:w-14">
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
                aria-hidden="true"
                className="h-6 w-6 sm:h-7 sm:w-7"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M7 3v18M17 3v18M3 7h4M3 12h4M3 17h4M17 7h4M17 12h4M17 17h4" />
              </svg>
            </div>

            <h2 className="text-lg font-bold transition group-hover:text-blue-400 sm:text-xl">
              Películas
            </h2>

            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
              Consultá y administrá las películas del catálogo.
            </p>

            <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-400">
              Ir a películas
              <span aria-hidden="true" className="transition group-hover:translate-x-1">
                →
              </span>
            </p>
          </Link>

          {/* Series */}
          <Link
            to="/admin/series"
            className="group flex min-h-56 flex-col rounded-2xl border border-slate-700 bg-slate-900/80 p-5 transition duration-200 hover:-translate-y-1 hover:border-purple-500 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400 sm:min-h-60 sm:p-6"
          >
            <div className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 transition group-hover:bg-purple-500/25 sm:h-14 sm:w-14">
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
                aria-hidden="true"
                className="h-6 w-6 sm:h-7 sm:w-7"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="m10 9 5 3-5 3z" />
              </svg>
            </div>

            <h2 className="text-lg font-bold transition group-hover:text-purple-400 sm:text-xl">
              Series
            </h2>

            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
              Consultá y administrá las series del catálogo.
            </p>

            <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-purple-400">
              Ir a series
              <span aria-hidden="true" className="transition group-hover:translate-x-1">
                →
              </span>
            </p>
          </Link>

          {/* Usuarios */}
          <Link
            to="/admin/usuarios"
            className="group flex min-h-56 flex-col rounded-2xl border border-slate-700 bg-slate-900/80 p-5 transition duration-200 hover:-translate-y-1 hover:border-emerald-500 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400 sm:col-span-2 sm:min-h-60 sm:p-6 lg:col-span-1"
          >
            <div className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 transition group-hover:bg-emerald-500/25 sm:h-14 sm:w-14">
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
                aria-hidden="true"
                className="h-6 w-6 sm:h-7 sm:w-7"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>

            <h2 className="text-lg font-bold transition group-hover:text-emerald-400 sm:text-xl">
              Usuarios
            </h2>

            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
              Consultá y administrá los usuarios registrados.
            </p>

            <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400">
              Ir a usuarios
              <span aria-hidden="true" className="transition group-hover:translate-x-1">
                →
              </span>
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
};
