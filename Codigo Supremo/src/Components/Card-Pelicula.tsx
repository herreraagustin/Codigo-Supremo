
import { Link } from "react-router-dom";
import type { Contenido } from "../services/peliculas";

interface CardPeliculaProps {
  pelicula: Contenido;
}

export const CardPelicula = ({ pelicula }: CardPeliculaProps) => {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 transition hover:-translate-y-1 hover:border-blue-500">
      {pelicula.poster ? (
        <img
          src={pelicula.poster}
          alt={`Póster de ${pelicula.name || "película o serie"}`}
          className="aspect-[2/3] w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex aspect-[2/3] items-center justify-center bg-slate-800 text-slate-400">
          Sin póster
        </div>
      )}

      <div className="p-3">
        <h3 className="mb-2 font-semibold text-white">
          {pelicula.name || pelicula.title || "Sin título"}
        </h3>

        <p className="mb-2 text-sm text-slate-400">
          {pelicula.year || "Año desconocido"}
          {pelicula.imdbRating ? ` · ⭐ ${pelicula.imdbRating}` : ""}
        </p>

        <p className="line-clamp-3 text-sm text-slate-300">
          {pelicula.description || "Sin descripción disponible."}
        </p>

        {pelicula.genres && (
          <p className="mt-3 text-xs text-blue-400">
            {pelicula.genres.join(" · ")}
          </p>
        )}

        <Link
          to={`/pelicula/${pelicula.id}`}
          className="mt-4 block rounded-lg bg-blue-500 px-4 py-2 text-center font-semibold text-white transition hover:bg-blue-600"
        >
          Ver detalles
        </Link>
      </div>
    </article>
  );
};
