
import { Link } from "react-router-dom";
import type { Contenido } from "../services/peliculas";

interface CardPeliculaProps {
  pelicula: Contenido;
}

export const CardPelicula = ({ pelicula }: CardPeliculaProps) => {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-950/40">
      {/* Póster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-800">
        {pelicula.poster ? (
          <img
            src={pelicula.poster}
            alt={`Póster de ${pelicula.name || pelicula.title || "película o serie"}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
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
          {pelicula.name || pelicula.title || "Sin título"}
        </h3>

        <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
          <span>{pelicula.year || "Año desconocido"}</span>

          {pelicula.imdbRating && (
            <span className="font-medium text-amber-400">
              ⭐ {pelicula.imdbRating}
            </span>
          )}
        </p>

        <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-300">
          {pelicula.description || "Sin descripción disponible."}
        </p>

        {pelicula.genres && pelicula.genres.length > 0 && (
          <p className="mb-4 line-clamp-2 text-xs font-medium leading-5 text-blue-400">
            {pelicula.genres.join(" · ")}
          </p>
        )}

        {/* Botón siempre abajo */}
        <div className="mt-auto pt-2">
          <Link
            to={`/pelicula/${pelicula.id}`}
            className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition-colors duration-200 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </article>
  );
};
