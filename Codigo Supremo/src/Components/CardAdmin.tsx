
import { Link } from "react-router-dom";
import type { Contenido } from "../services/peliculas";

interface CardAdminProps {
  contenido: Contenido;
  tipo: "movie" | "series";
  nota: number;
  generos: string[];
  confirmarBorrado: boolean;
  onEditar: (contenido: Contenido) => void;
  onSolicitarBorrado: (id: string) => void;
  onConfirmarBorrado: () => void;
  onCancelarBorrado: () => void;
}

export const CardAdmin = ({
  contenido,
  tipo,
  nota,
  generos,
  confirmarBorrado,
  onEditar,
  onSolicitarBorrado,
  onConfirmarBorrado,
  onCancelarBorrado,
}: CardAdminProps) => {
  const nombre = contenido.name || contenido.title || "Sin título";
  const anio = contenido.year;
  const esPelicula = tipo === "movie";
  const nombreTipo = esPelicula ? "película" : "serie";
  const rutaVolver = esPelicula ? "/admin/peliculas" : "/admin/series";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-950/40">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-800">
        {contenido.poster ? (
          <img
            src={contenido.poster}
            alt={`Póster de ${nombre}`}
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

      <div className="flex flex-1 flex-col p-4">
        <h2 className="mb-2 line-clamp-2 min-h-12 text-base font-bold leading-6 text-white">
          {nombre}
        </h2>

        <p className="mb-3 text-sm text-slate-400">
          Año: {anio || "No disponible"}
        </p>

        {nota > 0 && (
          <div
            className="mb-3 flex flex-wrap items-center gap-1"
            aria-label={`Calificación: ${nota} de 5`}
          >
            {Array.from({ length: 5 }, (_, indice) => (
              <span
                key={indice}
                className={indice < nota ? "text-amber-400" : "text-slate-600"}
              >
                ★
              </span>
            ))}
            <span className="ml-2 text-sm text-slate-400">{nota}/5</span>
          </div>
        )}

        {generos.length > 0 && (
          <p className="mb-3 line-clamp-2 text-sm leading-5 text-blue-300">
            {generos.join(" · ")}
          </p>
        )}

        <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-300">
          {contenido.description ||
            contenido.overview ||
            "Sin sinopsis disponible."}
        </p>

        <div className="mt-auto space-y-2 pt-2">
          <Link
            to={`/pelicula/${contenido.id}`}
            state={{ volverA: rutaVolver }}
            className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Ver detalles
          </Link>

          <button
            type="button"
            onClick={() => onEditar(contenido)}
            className="w-full rounded-xl bg-amber-500/15 px-4 py-3 text-sm font-bold text-amber-300 transition hover:bg-amber-500/25"
          >
            Editar datos
          </button>

          {confirmarBorrado ? (
            <div className="space-y-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm text-slate-200">
                ¿Seguro que querés borrar esta {nombreTipo}?
              </p>

              <button
                type="button"
                onClick={onConfirmarBorrado}
                className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Sí, borrar {nombreTipo}
              </button>

              <button
                type="button"
                onClick={onCancelarBorrado}
                className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
              >
                No, cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSolicitarBorrado(contenido.id)}
              className="w-full rounded-xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/25"
            >
              Borrar {nombreTipo}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
