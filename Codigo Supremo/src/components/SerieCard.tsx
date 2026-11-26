import { Link } from "react-router-dom";
<<<<<<< HEAD
import type { SerieResumen } from "../services/SeriesApi";
=======
import type { SerieResumen } from "../services/SeriesApi.ts";
>>>>>>> d4f20e548a0fc1ab8eed9c63bf77da7417c6bab6

interface Props {
  serie: SerieResumen;
}

export function SerieCard({ serie }: Props) {
<<<<<<< HEAD
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-950/40">
      {/* Póster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-800">
        {serie.poster ? (
          <img
            src={serie.poster}
            alt={`Póster de ${serie.name || "serie"}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(evento) => {
              evento.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Sin póster disponible
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
      </div>

      {/* Información */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 line-clamp-2 min-h-12 text-base font-bold leading-6 text-white">
          {serie.name || "Sin título"}
        </h3>

        <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
          <span>{serie.year || "Año desconocido"}</span>

          {serie.rating && (
            <span className="font-medium text-amber-400">
              ⭐ {serie.rating}
            </span>
          )}
        </p>

        <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-300">
          {serie.description || "Sin descripción disponible."}
        </p>

        {serie.genres && serie.genres.length > 0 && (
          <p className="mb-4 line-clamp-2 text-xs font-medium leading-5 text-blue-400">
            {serie.genres.join(" · ")}
          </p>
        )}

        {/* Botón siempre abajo */}
        <div className="mt-auto pt-2">
          <Link
            to={`/serie/${serie.id}`}
            className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition-colors duration-200 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </article>
  );
}
=======
  const generos = serie.genres.slice(0, 3).join(" · ");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#1c2840] bg-[#0b1220] transition duration-200 hover:-translate-y-1 hover:border-[#2f6bff]/60 hover:shadow-[0_10px_30px_rgba(26,92,255,0.15)] sm:rounded-2xl">
      <Link
        to={`/serie/${serie.id}`}
        aria-label={`Ver detalles de ${serie.name}`}
        className="block aspect-[2/3] w-full overflow-hidden bg-[#0a1020]"
      >
        <img
          src={serie.poster}
          alt={`Póster de ${serie.name}`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.visibility = "hidden";
          }}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:gap-2.5 sm:p-4">
        <h3
          title={serie.name}
          className="line-clamp-2 min-h-[2.5em] text-[13px] leading-tight font-bold text-white sm:min-h-[2.6em] sm:text-base"
        >
          {serie.name}
        </h3>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 sm:text-sm">
          {serie.year && <span>{serie.year}</span>}
          {serie.rating && (
            <span className="flex items-center gap-1 font-semibold text-slate-200">
              <span className="text-amber-400">★</span>
              {serie.rating}
            </span>
          )}
        </div>

        {/* La sinopsis se oculta en celular para que la card sea más chica */}
        {serie.description && (
          <p className="hidden text-sm leading-relaxed text-slate-300 sm:line-clamp-3">
            {serie.description}
          </p>
        )}

        {generos && (
          <p className="line-clamp-1 text-[10px] font-semibold text-blue-400 sm:text-xs">
            {generos}
          </p>
        )}

        <Link
          to={`/serie/${serie.id}`}
          className="mt-auto block rounded-lg bg-[#1a5cff] py-1.5 text-center text-[12px] font-bold text-white transition hover:bg-[#3b74ff] focus:ring-2 focus:ring-blue-400 focus:outline-none sm:rounded-xl sm:py-2.5 sm:text-sm"
        >
          Ver detalles
        </Link>
      </div>
    </article>
  );
}
>>>>>>> d4f20e548a0fc1ab8eed9c63bf77da7417c6bab6
