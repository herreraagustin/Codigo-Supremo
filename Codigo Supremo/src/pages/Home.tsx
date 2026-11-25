
import { useEffect, useState } from "react";
import { obtenerCatalogo } from "../services/peliculas";
import type { Contenido } from "../services/peliculas";
import {
  aplicarCambiosCatalogo,
} from "../services/almacenamiento";
import { obtenerGenerosDeContenido } from "../services/Generos";
import { mapContenido } from "../services/MapContenido";
import { CardPelicula } from "../components/Card-Pelicula";
import Hero from "../components/Hero";
import GenreFilter from "../components/GeneroFilter";

function listarGeneros(lista: Contenido[]): string[] {
  const mapa = new Map<string, string>();

  lista.forEach((item) => {
    obtenerGenerosDeContenido(item).forEach((genero) => {
      const clave = genero.toLowerCase();

      if (!mapa.has(clave)) {
        mapa.set(clave, genero);
      }
    });
  });

  return Array.from(mapa.values()).sort((a, b) =>
    a.localeCompare(b)
  );
}

function alternarGenero(
  genero: string,
  actual: string | null
): string | null {
  return actual?.toLowerCase() === genero.toLowerCase()
    ? null
    : genero;
}

function filtrarPorGenero(
  lista: Contenido[],
  genero: string | null
): Contenido[] {
  if (!genero) return lista;

  return lista.filter((item) =>
    obtenerGenerosDeContenido(item).some(
      (g) => g.toLowerCase() === genero.toLowerCase()
    )
  );
}

export const Home = () => {
  const [peliculas, setPeliculas] = useState<Contenido[]>([]);
  const [series, setSeries] = useState<Contenido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [generoPelicula, setGeneroPelicula] = useState<string | null>(
    null
  );
  const [generoSerie, setGeneroSerie] = useState<string | null>(null);

  useEffect(() => {
    let activa = true;

    async function cargarCatalogos() {
      try {
        const [datosPeliculas, datosSeries] = await Promise.all([
          obtenerCatalogo("movie"),
          obtenerCatalogo("series"),
        ]);

        if (!activa) return;

        setPeliculas(
          aplicarCambiosCatalogo(datosPeliculas, "movie")
        );

        setSeries(
          aplicarCambiosCatalogo(datosSeries, "series")
        );
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

    function detectarCambiosEntrePestanas(evento: StorageEvent) {
      if (evento.key === "cinerolling_cambios") {
        actualizarCatalogo();
      }
    }

    window.addEventListener(
      "catalogo-actualizado",
      actualizarCatalogo
    );

    window.addEventListener(
      "storage",
      detectarCambiosEntrePestanas
    );

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

  const generosPeliculas = listarGeneros(peliculas);
  const generosSeries = listarGeneros(series);

  const peliculasMostradas = filtrarPorGenero(
    peliculas,
    generoPelicula
  );

  const seriesMostradas = filtrarPorGenero(
    series,
    generoSerie
  );

  const mostrarCatalogo = (
    titulo: string,
    total: Contenido[],
    visibles: Contenido[],
    generoActivo: string | null
  ) => (
    <section className="mb-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">{titulo}</h2>

        <p className="text-xs text-slate-400">
          Mostrando {visibles.length} de {total.length}
        </p>
      </div>

      {visibles.length === 0 ? (
        <p className="text-slate-400">
          {generoActivo
            ? `No hay contenido del género "${generoActivo}".`
            : "Todavía no hay contenido para mostrar."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visibles.map((pelicula) => (
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
    <>
      <Hero movies={peliculas.map(mapContenido)} />

      <main className="bg-[#070b14] p-6 text-white md:p-10">
        {cargando ? (
          <p className="text-slate-400">
            Cargando catálogo...
          </p>
        ) : (
          <>
            <GenreFilter
              titulo="Géneros de películas"
              generos={generosPeliculas}
              activo={generoPelicula}
              onSelect={(genero) =>
                setGeneroPelicula((actual) =>
                  alternarGenero(genero, actual)
                )
              }
              onClear={() => setGeneroPelicula(null)}
            />

            {mostrarCatalogo(
              "Películas",
              peliculas,
              peliculasMostradas,
              generoPelicula
            )}

            <GenreFilter
              titulo="Géneros de series"
              generos={generosSeries}
              activo={generoSerie}
              onSelect={(genero) =>
                setGeneroSerie((actual) =>
                  alternarGenero(genero, actual)
                )
              }
              onClear={() => setGeneroSerie(null)}
            />

            {mostrarCatalogo(
              "Series",
              series,
              seriesMostradas,
              generoSerie
            )}
          </>
        )}
      </main>
    </>
  );
};
