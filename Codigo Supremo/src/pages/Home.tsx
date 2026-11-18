
import { useEffect, useState } from "react";
import { obtenerCatalogo } from "../services/peliculas";
import type { Contenido } from "../services/peliculas";
import { obtenerCambios } from "../services/almacenamiento";
import { CardPelicula } from "../components/Card-Pelicula";

export const Home = () => {
  const [peliculas, setPeliculas] = useState<Contenido[]>([]);
  const [series, setSeries] = useState<Contenido[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activa = true;

    async function cargarCatalogos() {
      try {
        const [datosPeliculas, datosSeries] = await Promise.all([
          obtenerCatalogo("movie"),
          obtenerCatalogo("series"),
        ]);

        if (!activa) return;

        const cambios = obtenerCambios();

        const peliculasVisibles = datosPeliculas.filter(
          (pelicula) => !cambios.eliminadas.movie.includes(pelicula.id)
        );

        const seriesVisibles = datosSeries.filter(
          (serie) => !cambios.eliminadas.series.includes(serie.id)
        );

        setPeliculas([
          ...cambios.agregadas.movie,
          ...peliculasVisibles.filter(
            (original) =>
              !cambios.agregadas.movie.some(
                (agregada) => agregada.id === original.id
              )
          ),
        ]);

        setSeries([
          ...cambios.agregadas.series,
          ...seriesVisibles.filter(
            (original) =>
              !cambios.agregadas.series.some(
                (agregada) => agregada.id === original.id
              )
          ),
        ]);
      } catch (error) {
        console.error("Error al cargar los catálogos:", error);
      } finally {
        if (activa) {
          setCargando(false);
        }
      }
    }

    function actualizarCatalogo() {
      void cargarCatalogos();
    }

    // Cambios realizados en esta misma pestaña.
    window.addEventListener(
      "catalogo-actualizado",
      actualizarCatalogo
    );

    // Cambios realizados desde otras pestañas.
    function detectarCambiosEntrePestanas(evento: StorageEvent) {
      if (evento.key === "cinerolling_cambios") {
        actualizarCatalogo();
      }
    }

    window.addEventListener("storage", detectarCambiosEntrePestanas);

    void cargarCatalogos();

    return () => {
      activa = false;

      window.removeEventListener(
        "catalogo-actualizado",
        actualizarCatalogo
      );

      window.removeEventListener(
        "storage",
        detectarCambiosEntrePestanas
      );
    };
  }, []);

  const mostrarCatalogo = (
    titulo: string,
    contenido: Contenido[]
  ) => (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-bold">{titulo}</h2>

      {contenido.length === 0 ? (
        <p className="text-slate-400">
          Todavía no hay contenido para mostrar.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {contenido.map((pelicula) => (
            <CardPelicula
              key={pelicula.id}
              pelicula={pelicula}
            />
          ))}
        </div>
      )}
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
