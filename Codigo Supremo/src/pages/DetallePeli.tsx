
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerCatalogo } from "../services/peliculas";
import type { Contenido } from "../services/peliculas";

export const DetallePeli = () => {
  const { id } = useParams();
  const [pelicula, setPelicula] = useState<Contenido | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarPelicula() {
      try {
        const peliculas = await obtenerCatalogo("movie");
        const series = await obtenerCatalogo("series");

        const encontrada = [...peliculas, ...series].find(
          (contenido) => contenido.id === id
        );

        setPelicula(encontrada ?? null);
      } catch (error) {
        console.error("Error al cargar el contenido:", error);
      } finally {
        setCargando(false);
      }
    }

    cargarPelicula();
  }, [id]);

  if (cargando) {
    return (
      <main className="min-h-screen bg-[#070b14] p-6 text-white">
        Cargando detalles...
      </main>
    );
  }

  if (!pelicula) {
    return (
      <main className="min-h-screen bg-[#070b14] p-6 text-white">
        <h1 className="mb-4 text-2xl font-bold">
          No se encontró la película
        </h1>
        <Link to="/" className="text-blue-400 hover:underline">
          Volver al inicio
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] p-6 text-white md:p-10">
      <Link to="/" className="mb-8 inline-block text-blue-400 hover:underline">
        ← Volver al catálogo
      </Link>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[280px_1fr]">
        {pelicula.poster && (
          <img
            src={pelicula.poster}
            alt={`Póster de ${pelicula.name || pelicula.title || "película"}`}
            className="w-full rounded-xl object-cover"
          />
        )}

        <section>
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">
            {pelicula.name || pelicula.title || "Sin título"}
          </h1>

          <p className="mb-4 text-slate-400">
            {pelicula.year || "Año desconocido"}
            {pelicula.imdbRating
              ? ` · ⭐ ${pelicula.imdbRating}`
              : ""}
          </p>

          <h2 className="mb-2 text-xl font-semibold">Sinopsis</h2>
          <p className="mb-6 leading-7 text-slate-300">
            {pelicula.description ||
              pelicula.overview ||
              "No hay una descripción disponible."}
          </p>

          {pelicula.genres && (
            <p className="text-blue-400">
              Géneros: {pelicula.genres.join(" · ")}
            </p>
          )}
        </section>
      </div>
    </main>
  );
};
