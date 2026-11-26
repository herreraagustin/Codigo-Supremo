
import { useEffect, useState } from "react";
import { obtenerCatalogo } from "../services/peliculas";
import type { Contenido } from "../services/peliculas";
import { aplicarCambiosCatalogo } from "../services/almacenamiento";
import { obtenerGenerosDeContenido } from "../services/Generos";
import { mapContenido } from "../services/MapContenido";
import { CardPelicula } from "../Components/Card-Pelicula";
import Hero from "../Components/Hero";
import GenreFilter from "../Components/GeneroFilter";

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

  return Array.from(mapa.values()).sort((a, b) => a.localeCompare(b));
}

function alternarGenero(
  genero: string,
  actual: string | null
): string | null {
  return actual?.toLowerCase() === genero.toLowerCase() ? null : genero;
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

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function filtrarPorBusqueda(
  lista: Contenido[],
  busqueda: string
): Contenido[] {
  const termino = normalizar(busqueda);

  if (!termino) return lista;

  return lista.filter((item) =>
    normalizar(String(item.name ?? item.title ?? "")).includes(termino)
  );
}

export const Home = ({ searchTerm }: { searchTerm: string }) => {
  const [peliculas, setPeliculas] = useState<Contenido[]>([]);
  const [series, setSeries] = useState<Contenido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [generoPelicula, setGeneroPelicula] = useState<string | null>(null);
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

        setPeliculas(aplicarCambiosCatalogo(datosPeliculas, "movie"));
        setSeries(aplicarCambiosCatalogo(datosSeries, "series"));
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

    window.addEventListener("catalogo-actualizado", actualizarCatalogo);

    function detectarCambiosEntrePestanas(evento: StorageEvent) {
      if (evento.key === "cinerolling_cambios") {
        actualizarCatalogo();
      }
    }

    window.addEventListener("storage", detectarCambiosEntrePestanas);

    void cargarCatalogos();

    return () => {
      activa = false;
      window.removeEventListener("catalogo-actualizado", actualizarCatalogo);
      window.removeEventListener("storage", detectarCambiosEntrePestanas);
    };
  }, []);

  const generosPeliculas = listarGeneros(peliculas);
  const generosSeries = listarGeneros(series);

  const peliculasMostradas = filtrarPorBusqueda(
    filtrarPorGenero(peliculas, generoPelicula),
    searchTerm
  );

  const seriesMostradas = filtrarPorBusqueda(
    filtrarPorGenero(series, generoSerie),
    searchTerm
  );

  const buscando = searchTerm.trim() !== "";

  const mostrarCatalogo = (
    titulo: string,
    total: Contenido[],
    visibles: Contenido[],
    generoActivo: string | null
  ) => (
    <section className="mb-10 min-w-0 sm:mb-14">
      <div className="mb-4 flex flex-col items-start gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold leading-tight sm:text-2xl md:text-3xl">
          {titulo}
        </h2>

        <p className="text-xs text-slate-400 sm:text-sm">
          Mostrando {visibles.length} de {total.length}
        </p>
      </div>

      {visibles.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center sm:px-6 sm:py-10">
          <p className="text-sm leading-6 text-slate-400 sm:text-base">
            {buscando
              ? `No se encontraron resultados para "${searchTerm}".`
              : generoActivo
                ? `No hay contenido del género "${generoActivo}".`
                : "Todavía no hay contenido para mostrar."}
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {visibles.map((pelicula) => (
            <CardPelicula key={pelicula.id} pelicula={pelicula} />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-[#070b14] text-white">
      {!buscando && <Hero movies={peliculas.map(mapContenido)} />}

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 xl:px-12">
        {cargando ? (
          <div className="flex min-h-48 items-center justify-center">
            <p
              className="text-center text-sm text-slate-400 sm:text-base"
              role="status"
            >
              Cargando catálogo...
            </p>
          </div>
        ) : (
          <>
            <GenreFilter
              titulo="Géneros de películas"
              generos={generosPeliculas}
              activo={generoPelicula}
              onSelect={(genero) =>
                setGeneroPelicula((actual) => alternarGenero(genero, actual))
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
                setGeneroSerie((actual) => alternarGenero(genero, actual))
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
    </div>
  );
};
