import { Link } from "react-router-dom";
import type { SerieResumen } from "../services/SeriesApi.ts";

interface Props {
  serie: SerieResumen;
}

export function SerieCard({ serie }: Props) {
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
