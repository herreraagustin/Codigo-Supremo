
import { useEffect, useState } from "react";
import { obtenerCatalogo } from "../services/peliculas";
import type { Contenido } from "../services/peliculas";
import { CardPelicula } from "../components/Card-Pelicula";

export const Home = () => {
  const [peliculas, setPeliculas] = useState<Contenido[]>([]);
  const [series, setSeries] = useState<Contenido[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const [datosPeliculas, datosSeries] = await Promise.all([
          obtenerCatalogo("movie"),
          obtenerCatalogo("series"),
        ]);

        setPeliculas(datosPeliculas);
        setSeries(datosSeries);
      } catch (error) {
        console.error("Error al cargar los catálogos:", error);
      } finally {
        setCargando(false);
      }
    }

    cargarCatalogos();
  }, []);

  const mostrarCatalogo = (
    titulo: string,
    contenido: Contenido[]
  ) => (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-bold">{titulo}</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {contenido.map((pelicula) => (
          <CardPelicula
            key={pelicula.id}
            pelicula={pelicula}
          />
        ))}
      </div>
    </section>
  );

  return (
    <main className="min-h-screen bg-[#070b14] p-6 text-white md:p-10">
      <h1 className="mb-8 text-3xl font-bold md:text-4xl">
        CineRolling
      </h1>

      {cargando ? (
        <p className="text-slate-400">Cargando catálogo...</p>
      ) : (
        <>
          {mostrarCatalogo("Películas", peliculas)}
          {mostrarCatalogo("Series", series)}
        </>
      )}
    </main>
  );
};
