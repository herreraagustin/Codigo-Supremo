
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
          setContenido(contenidoLocal);
          return;
        }

        const [peliculas, series] = await Promise.all([
          obtenerCatalogo("movie"),
          obtenerCatalogo("series"),
        ]);

        const encontrado = [...peliculas, ...series].find(
          (item) => item.id === id
        );

        setContenido(encontrado ?? null);
      } catch (error) {
        console.error("Error al cargar los detalles:", error);
        setContenido(null);
      } finally {
        setCargando(false);
      }
    }

    void cargarDetalles();
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
      <main className="min-h-screen bg-[#070b14] p-6 text-white">
        Cargando detalles...
      </main>
    );
  }

  if (!contenido) {
    return (
      <main className="min-h-screen bg-[#070b14] p-6 text-white">
        <h1 className="mb-4 text-2xl font-bold">
          No se encontró el contenido
        </h1>

        <button
          type="button"
          onClick={volver}
          className="text-blue-400 hover:underline"
        >
          Volver
        </button>
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
          .split(",")
          .map((genero) => genero.trim())
          .filter(Boolean)
      : [];

  const esSerie =
    contenido.type === "series" ||
    contenido.id.startsWith("local-series-");

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-8 text-white md:p-10">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={volver}
          className="mb-8 inline-block text-blue-400 hover:underline"
        >
          ← Volver al catálogo
        </button>

        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <div>
            {contenido.poster ? (
              <img
                src={contenido.poster}
                alt={`Póster de ${titulo}`}
                className="mx-auto w-full max-w-sm rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-80 items-center justify-center rounded-xl bg-gray-800 text-gray-400">
                Sin póster disponible
              </div>
            )}
          </div>

          <section>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-400">
              {esSerie ? "Serie" : "Película"}
            </p>

            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              {titulo}
            </h1>

            <p className="mb-6 text-slate-400">
              {contenido.year || "Año desconocido"}
              {contenido.imdbRating
                ? ` · ⭐ ${contenido.imdbRating}`
                : ""}
            </p>

            <h2 className="mb-2 text-xl font-semibold">Sinopsis</h2>

            <p className="mb-6 whitespace-pre-line leading-7 text-slate-300">
              {descripcion}
            </p>

            <h2 className="mb-3 text-xl font-semibold">Géneros</h2>

            {generos.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {generos.map((genero, indice) => (
                  <span
                    key={`${genero}-${indice}`}
                    className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-sm text-blue-300"
                  >
                    {genero}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">
                No hay géneros disponibles.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};
