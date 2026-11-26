
import { Link } from "react-router-dom";

export const Error404 = () => {
  return (
    <main className="relative flex min-h-[70vh] min-h-[70dvh] flex-col items-center justify-center overflow-hidden bg-[#070b14] px-4 py-12 text-center text-white sm:min-h-[75vh] sm:min-h-[75dvh] sm:px-6 sm:py-16 lg:px-8">
      {/* Luz decorativa */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl sm:h-72 sm:w-72 sm:blur-[100px]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center">
        <span className="mb-5 max-w-full rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-300 sm:px-4 sm:text-xs sm:tracking-[0.25em] md:text-sm">
          CineRolling · Error de navegación
        </span>

        <h1 className="bg-gradient-to-r from-cyan-300 via-blue-400 to-blue-600 bg-clip-text text-6xl font-black leading-none tracking-tight text-transparent sm:text-8xl md:text-9xl">
          404
        </h1>

        <h2 className="mt-5 max-w-2xl break-words text-2xl font-bold leading-tight sm:mt-6 sm:text-3xl md:text-4xl">
          Parece que esta película salió de cartelera
        </h2>

        <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">
          La página que buscás no existe o fue trasladada a otra sala.
          Pero no te preocupes, ¡todavía hay muchas historias por descubrir!
        </p>

        <Link
          to="/"
          className="mt-7 inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-3 rounded-xl bg-blue-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-1 hover:bg-blue-400 hover:shadow-blue-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#070b14] sm:mt-8 sm:w-auto sm:px-6 sm:text-base"
        >
          <span aria-hidden="true">←</span>
          Volver al inicio
        </Link>

        <p className="mt-6 text-xs text-slate-500 sm:text-sm">
          La función continúa en CineRolling.
        </p>
      </div>
    </main>
  );
};
