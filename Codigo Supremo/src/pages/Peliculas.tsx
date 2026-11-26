import { useEffect, useState } from "react";
import { obtenerCatalogo } from "../services/peliculas";
import type { Contenido } from "../services/peliculas";
import { obtenerCambios } from "../services/almacenamiento";
import { obtenerGenerosDeContenido } from "../services/Generos";
import { CardPelicula } from "../Components/Card-Pelicula";
import GenreFilter from "../Components/GeneroFilter";

function listarGeneros(lista: Contenido[]): string[] {
  const mapa = new Map<string, string>();

  lista.forEach((item) => {
    obtenerGenerosDeContenido(item).forEach((genero) => {
      const clave = genero.toLowerCase();
      if (!mapa.has(clave)) mapa.set(clave, genero);
    });
  });

  return Array.from(mapa.values()).sort((a, b) => a.localeCompare(b));
}

function alternarGenero(genero: string, actual: string | null): string | null {
  return actual?.toLowerCase() === genero.toLowerCase() ? null : genero;
}

function filtrarPorGenero(lista: Contenido[], genero: string | null) {
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

function filtrarPorBusqueda(lista: Contenido[], busqueda: string) {
  const termino = normalizar(busqueda);
  if (!termino) return lista;

  return lista.filter((item) =>
    normalizar(String(item.name ?? item.title ?? "")).includes(termino)
  );
}

export const Peliculas = ({ searchTerm }: { searchTerm: string }) => {
  const [peliculas, setPeliculas] = useState<Contenido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [generoActivo, setGeneroActivo] = useState<string | null>(null);

  useEffect(() => {
    let activa = true;

    async function cargarPeliculas() {
      try {
        const datos = await obtenerCatalogo("movie");

        if (!activa) return;

        const cambios = obtenerCambios();

        const visibles = datos.filter(
          (pelicula) => !cambios.eliminadas.movie.includes(pelicula.id)
        );

        setPeliculas([
          ...cambios.agregadas.movie,
          ...visibles.filter(
            (original) =>
              !cambios.agregadas.movie.some(
                (agregada) => agregada.id === original.id
              )
          ),
        ]);
        setError("");
      } catch (err) {
        console.error("Error al cargar las películas:", err);
        if (activa) setError("No se pudieron cargar las películas.");
      } finally {
        if (activa) setCargando(false);
      }
    }

    function actualizarCatalogo() {
      void cargarPeliculas();
    }

    window.addEventListener("catalogo-actualizado", actualizarCatalogo);

    function detectarCambiosEntrePestanas(evento: StorageEvent) {
      if (evento.key === "cinerolling_cambios") {
        actualizarCatalogo();
      }
    }

    window.addEventListener("storage", detectarCambiosEntrePestanas);

    void cargarPeliculas();

    return () => {
      activa = false;
      window.removeEventListener("catalogo-actualizado", actualizarCatalogo);
      window.removeEventListener("storage", detectarCambiosEntrePestanas);
    };
  }, []);

  const generos = listarGeneros(peliculas);

  const visibles = filtrarPorBusqueda(
    filtrarPorGenero(peliculas, generoActivo),
    searchTerm
  );
  const buscando = searchTerm.trim() !== "";

  return (
    <main className="bg-[#070b14] p-6 text-white md:p-10">
      <header className="mx-auto mb-8 max-w-7xl">
        <h1 className="text-3xl font-extrabold md:text-4xl">
          <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
            Películas
          </span>
        </h1>
        <p className="mt-2 text-slate-400">
          Todo el catálogo de películas en un solo lugar.
        </p>
      </header>

      <div className="mx-auto max-w-7xl">
        {error && (
          <p
            role="alert"
            className="mb-6 rounded-lg bg-red-950 p-3 text-red-300"
          >
            {error}
          </p>
        )}

        {cargando ? (
          <p className="text-slate-400">Cargando películas...</p>
        ) : (
          <>
            <GenreFilter
              titulo="Géneros de películas"
              generos={generos}
              activo={generoActivo}
              onSelect={(g) => setGeneroActivo((a) => alternarGenero(g, a))}
              onClear={() => setGeneroActivo(null)}
            />

            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Todas las películas</h2>
              <p className="text-xs text-slate-400">
                Mostrando {visibles.length} de {peliculas.length}
              </p>
            </div>

            {visibles.length === 0 ? (
              <p className="text-slate-400">
                {buscando
                  ? `No se encontraron resultados para "${searchTerm}".`
                  : generoActivo
                    ? `No hay películas del género "${generoActivo}".`
                    : "Todavía no hay películas para mostrar."}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {visibles.map((pelicula) => (
                  <CardPelicula key={pelicula.id} pelicula={pelicula} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};