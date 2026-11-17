
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerCatalogo } from "../services/peliculas";
import type { Contenido } from "../services/peliculas";

export const Admin = () => {
  const [peliculas, setPeliculas] = useState<Contenido[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarPeliculas() {
      try {
        setError("");
        const datos = await obtenerCatalogo("movie");
        setPeliculas(datos);
      } catch (error) {
        console.error("Error al cargar las películas:", error);
        setError("No se pudieron cargar las películas.");
      } finally {
        setCargando(false);
      }
    }

    cargarPeliculas();
  }, []);

  const peliculasFiltradas = peliculas.filter((pelicula) => {
    const titulo = pelicula.name || pelicula.title || "";

    return titulo.toLowerCase().includes(busqueda.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-[#070b14] p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="mb-6 inline-block text-blue-400 hover:text-blue-300"
        >
          ← Volver al inicio
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold md:text-4xl">
            Panel de Administración
          </h1>

          <p className="mt-2 text-slate-400">
            Consultá y buscá las películas del catálogo.
          </p>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Películas cargadas
            </p>
            <p className="mt-2 text-3xl font-bold">
              {cargando ? "..." : peliculas.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Resultados de búsqueda
            </p>
            <p className="mt-2 text-3xl font-bold">
              {cargando ? "..." : peliculasFiltradas.length}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900 p-5 md:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold">
              Listado de películas
            </h2>

            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar película..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none placeholder:text-slate-400 focus:border-blue-500 sm:max-w-xs"
            />
          </div>

          {cargando ? (
            <p className="py-8 text-center text-slate-400">
              Cargando películas...
            </p>
          ) : error ? (
            <p className="py-8 text-center text-red-400">
              {error}
            </p>
          ) : peliculasFiltradas.length === 0 ? (
            <p className="py-8 text-center text-slate-400">
              No se encontraron películas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead>
                  <tr className="border-b border-slate-700 text-sm text-slate-400">
                    <th className="px-3 py-4">Póster</th>
                    <th className="px-3 py-4">Título</th>
                    <th className="px-3 py-4">Año</th>
                    <th className="px-3 py-4">Calificación</th>
                    <th className="px-3 py-4">Detalles</th>
                  </tr>
                </thead>

                <tbody>
                  {peliculasFiltradas.map((pelicula) => (
                    <tr
                      key={pelicula.id}
                      className="border-b border-slate-800 transition hover:bg-slate-800/60"
                    >
                      <td className="px-3 py-3">
                        {pelicula.poster ? (
                          <img
                            src={pelicula.poster}
                            alt={`Póster de ${pelicula.name || pelicula.title || "película"}`}
                            className="h-20 w-14 rounded object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-sm text-slate-500">
                            Sin póster
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3 font-medium">
                        {pelicula.name || pelicula.title || "Sin título"}
                      </td>

                      <td className="px-3 py-3 text-slate-300">
                        {pelicula.year || "Desconocido"}
                      </td>

                      <td className="px-3 py-3 text-slate-300">
                        {pelicula.imdbRating
                          ? `⭐ ${pelicula.imdbRating}`
                          : "Sin calificación"}
                      </td>

                      <td className="px-3 py-3">
                        <Link
                          to={`/pelicula/${pelicula.id}`}
                          className="text-blue-400 hover:underline"
                        >
                          Ver película
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

