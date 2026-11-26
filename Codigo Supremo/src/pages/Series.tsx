import { useEffect, useState } from "react";
import { SerieCard } from "../components/SerieCard";
import GenreFilter from "../components/GeneroFilter";
import {
  obtenerCatalogo,
  type Contenido,
} from "../services/peliculas";
import { aplicarCambiosCatalogo } from "../services/almacenamiento";
import {
  posterDe,
  type SerieResumen,
} from "../services/SeriesApi";


type SeriesProps = {
  searchTerm?: string;
};

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function convertirSerie(contenido: Contenido): SerieResumen {
  const id = String(contenido.id);
  const generos = Array.isArray(contenido.genres)
    ? contenido.genres.map(String)
    : [];
  const rating = contenido.imdbRating ?? contenido.rating ?? "";

  return {
    id,
    name: String(contenido.name ?? contenido.title ?? "Sin título"),
    poster: String(contenido.poster || posterDe(id)),
    year: String(contenido.year ?? ""),
    rating: rating == null ? "" : String(rating),
    description: String(
      contenido.description ?? contenido.overview ?? ""
    ),
    genres: generos,
  };
}

function listarGeneros(series: SerieResumen[]): string[] {
  const generos = new Map<string, string>();

  series.forEach((serie) => {
    serie.genres.forEach((genero) => {
      const nombre = genero.trim();
      if (!nombre) return;

      const clave = normalizar(nombre);
      if (!generos.has(clave)) generos.set(clave, nombre);
    });
  });

  return Array.from(generos.values()).sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

function alternarGenero(
  genero: string,
  actual: string | null
): string | null {
  return actual && normalizar(actual) === normalizar(genero)
    ? null
    : genero;
}

function filtrarPorGenero(
  series: SerieResumen[],
  generoActivo: string | null
): SerieResumen[] {
  if (!generoActivo) return series;

  return series.filter((serie) =>
    serie.genres.some(
      (genero) => normalizar(genero) === normalizar(generoActivo)
    )
  );
}

function filtrarPorBusqueda(
  series: SerieResumen[],
  searchTerm: string
): SerieResumen[] {
  const busqueda = normalizar(searchTerm);
  if (!busqueda) return series;

  return series.filter((serie) =>
    normalizar(serie.name).includes(busqueda)
  );
}

export function Series({ searchTerm = "" }: SeriesProps) {
  const [series, setSeries] = useState<SerieResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generoActivo, setGeneroActivo] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;

    async function cargarSeries() {
      try {
        setCargando(true);
        setError(null);

        const originales = await obtenerCatalogo("series");
        const actualizadas = aplicarCambiosCatalogo(
          originales,
          "series"
        );
        const seriesConvertidas = actualizadas.map(convertirSerie);

        if (montado) setSeries(seriesConvertidas);
      } catch (err) {
        console.error("Error al cargar las series:", err);

        if (montado) {
          setError(
            "No se pudieron cargar las series. Revisá tu conexión e intentá nuevamente."
          );
        }
      } finally {
        if (montado) setCargando(false);
      }
    }

    const actualizarCatalogo = () => {
      void cargarSeries();
    };

    const actualizarDesdeStorage = (evento: StorageEvent) => {
      if (evento.key === "cinerolling_cambios") {
        actualizarCatalogo();
      }
    };

    void cargarSeries();

    window.addEventListener("catalogo-actualizado", actualizarCatalogo);
    window.addEventListener("storage", actualizarDesdeStorage);

    return () => {
      montado = false;
      window.removeEventListener(
        "catalogo-actualizado",
        actualizarCatalogo
      );
      window.removeEventListener("storage", actualizarDesdeStorage);
    };
  }, []);

  const generos = listarGeneros(series);
  const seriesPorGenero = filtrarPorGenero(series, generoActivo);
  const visibles = filtrarPorBusqueda(seriesPorGenero, searchTerm);
  const buscando = searchTerm.trim() !== "";

  return (
    <main className="bg-[#070b14] p-6 text-white md:p-10">
      <header className="mx-auto mb-8 max-w-7xl">
        <h1 className="text-3xl font-extrabold md:text-4xl">
          <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
            Series
          </span>
        </h1>

        <p className="mt-2 text-slate-400">
          Explorá nuestro catálogo de series y encontrá tu próxima
          historia favorita.
        </p>
      </header>

      <div className="mx-auto max-w-7xl">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg bg-red-950 p-3 text-red-300"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new Event("catalogo-actualizado"))
              }
              className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-semibold transition hover:bg-red-500/30"
            >
              Reintentar
            </button>
          </div>
        )}

        {cargando ? (
          <p className="text-slate-400">Cargando series...</p>
        ) : (
          <>
            <GenreFilter
              titulo="Géneros de series"
              generos={generos}
              activo={generoActivo}
              onSelect={(genero) =>
                setGeneroActivo((actual) =>
                  alternarGenero(genero, actual)
                )
              }
              onClear={() => setGeneroActivo(null)}
            />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Todas las series</h2>

              <p className="text-xs text-slate-400">
                Mostrando {visibles.length} de {series.length}
              </p>
            </div>

            {visibles.length === 0 ? (
              <p className="text-slate-400">
                {buscando
                  ? `No se encontraron resultados para "${searchTerm}".`
                  : generoActivo
                    ? `No hay series del género "${generoActivo}".`
                    : "Todavía no hay series para mostrar."}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {visibles.map((serie) => (
                  <SerieCard key={serie.id} serie={serie} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}