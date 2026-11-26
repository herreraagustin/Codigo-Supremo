import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiFilm, FiStar } from "react-icons/fi";
import { obtenerCatalogo } from "../services/peliculas";
import type { Contenido } from "../services/peliculas";
import { obtenerCambios } from "../services/almacenamiento";

export const DetallePeli = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const volverA = (
    location.state as { volverA?: string } | null
  )?.volverA;

  const [contenido, setContenido] = useState<Contenido | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activa = true;

    async function cargarDetalles() {
      setCargando(true);
      setContenido(null);

      try {
        const cambios = obtenerCambios();

        const contenidoLocal = [
          ...cambios.agregadas.movie,
          ...cambios.agregadas.series,
          ...cambios.editadas.movie,
          ...cambios.editadas.series,
        ].find((item) => item.id === id);

        if (contenidoLocal) {
          if (activa) setContenido(contenidoLocal);
          return;
        }

        const [peliculas, series] = await Promise.all([
          obtenerCatalogo("movie"),
          obtenerCatalogo("series"),
        ]);

        const encontrado = [...peliculas, ...series].find(
          (item) => item.id === id
        );

        if (activa) setContenido(encontrado ?? null);
      } catch (error) {
        console.error("Error al cargar los detalles:", error);
        if (activa) setContenido(null);
      } finally {
        if (activa) setCargando(false);
      }
    }

    void cargarDetalles();

    return () => {
      activa = false;
    };
  }, [id]);

  const volver = () => {
    if (volverA) {
      navigate(volverA);
    } else {
      navigate("/");
    }
  };

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b14] px-4 py-10 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          <p className="text-sm text-slate-400 sm:text-base">
            Cargando detalles...
          </p>
        </div>
      </main>
    );
  }

  if (!contenido) {
    return (
      <main className="flex min-h-screen items-center justify-center overflow-x-hidden bg-[#070b14] px-4 py-10 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0b1220] p-6 text-center sm:p-8">
          <FiFilm className="mx-auto mb-4 text-4xl text-slate-500" />

          <h1 className="text-xl font-bold sm:text-2xl">
            No se encontró el contenido
          </h1>

          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Es posible que haya sido eliminado o que ya no esté disponible.
          </p>

          <button
            type="button"
            onClick={volver}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-bold transition hover:bg-blue-400 sm:text-base"
          >
            <FiArrowLeft />
            Volver
          </button>
        </div>
      </main>
    );
  }

  const titulo = contenido.name || contenido.title || "Sin título";

  const descripcion =
    contenido.description ||
    contenido.overview ||
    "No hay una descripción disponible.";

  const generos = Array.isArray(contenido.genres)
    ? contenido.genres
    : typeof contenido.genre === "string"
      ? contenido.genre
          .split(/[,|]/)
          .map((genero) => genero.trim())
          .filter(Boolean)
      : [];

  const esSerie =
    contenido.type === "series" ||
    contenido.id.startsWith("local-series-");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-6xl min-w-0">
        <button
          type="button"
          onClick={volver}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:bg-slate-800 hover:text-white sm:mb-8 sm:text-base"
        >
          <FiArrowLeft />
          Volver al catálogo
        </button>

        <div className="grid min-w-0 grid-cols-1 items-start gap-6 sm:gap-8 md:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] lg:gap-12">
          {/* Póster */}
          <div className="mx-auto w-full max-w-[280px] min-w-0 sm:max-w-sm md:mx-0 md:max-w-none">
            {contenido.poster ? (
              <img
                src={contenido.poster}
                alt={`Póster de ${titulo}`}
                className="aspect-[2/3] w-full rounded-xl border border-slate-800 object-cover shadow-xl shadow-black/20"
              />
            ) : (
              <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl border border-slate-800 bg-gray-800 p-4 text-center text-sm text-gray-400 sm:text-base">
                Sin póster disponible
              </div>
            )}
          </div>

          {/* Información */}
          <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300 sm:text-sm">
                <FiFilm />
                {esSerie ? "Serie" : "Película"}
              </span>
            </div>

            <h1 className="break-words text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              {titulo}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400 sm:text-base">
              <span>{contenido.year || "Año desconocido"}</span>

              {contenido.imdbRating && (
                <span className="inline-flex items-center gap-1.5">
                  <FiStar className="text-yellow-400" />
                  {contenido.imdbRating}
                </span>
              )}
            </div>

            <div className="mt-7 sm:mt-8">
              <h2 className="mb-3 text-xl font-bold sm:text-2xl">
                Sinopsis
              </h2>

              <p className="whitespace-pre-line break-words text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                {descripcion}
              </p>
            </div>

            <div className="mt-7 sm:mt-8">
              <h2 className="mb-3 text-xl font-bold sm:text-2xl">
                Géneros
              </h2>

              {generos.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {generos.map((genero, indice) => (
                    <span
                      key={`${genero}-${indice}`}
                      className="max-w-full break-words rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300 sm:text-sm"
                    >
                      {genero}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 sm:text-base">
                  No hay géneros disponibles.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};