import { useEffect, useMemo, useState } from "react";
import { SerieCard } from "../Components/SerieCard";
import { getSeries } from "../services/SeriesApi";
import type { SerieResumen } from "../services/SeriesApi";

const GENEROS = [
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Sport",
  "Thriller",
];

const ICONOS: Record<string, string> = {
  Drama: "🎭",
  Romance: "💞",
};

interface Resultado {
  clave: string;
  series: SerieResumen[];
  error: boolean;
  skip: number;
  hayMas: boolean;
}

interface Props {
  searchTerm?: string;
}

export function Series({ searchTerm = "" }: Props) {
  const [genero, setGenero] = useState("");
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [errorMas, setErrorMas] = useState(false);
  const [panelAbierto, setPanelAbierto] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 768,
  );

  const clave = `${genero}|${intento}`;
  const cargando = resultado?.clave !== clave;

  useEffect(() => {
    const ctrl = new AbortController();

    getSeries({
      genre: genero,
      skip: 0,
      signal: ctrl.signal,
    })
      .then((lote) => {
        if (ctrl.signal.aborted) return;

        setResultado({
          clave,
          series: lote,
          error: false,
          skip: lote.length,
          hayMas: lote.length >= 20,
        });
      })
      .catch((error: unknown) => {
        if (
          ctrl.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }

        setResultado({
          clave,
          series: [],
          error: true,
          skip: 0,
          hayMas: false,
        });
      });

    return () => ctrl.abort();
  }, [genero, clave]);

  const cargarMas = async () => {
    if (!resultado || cargandoMas || cargando) return;

    const claveActual = clave;
    const skipActual = resultado.skip;

    setCargandoMas(true);
    setErrorMas(false);

    try {
      const lote = await getSeries({
        genre: genero,
        skip: skipActual,
      });

      setResultado((prev) => {
        if (!prev || prev.clave !== claveActual) return prev;

        const ids = new Set(prev.series.map((serie) => serie.id));
        const nuevas = lote.filter((serie) => !ids.has(serie.id));

        return {
          ...prev,
          series: [...prev.series, ...nuevas],
          skip: prev.skip + lote.length,
          hayMas: nuevas.length > 0 && lote.length >= 20,
        };
      });
    } catch {
      setErrorMas(true);
    } finally {
      setCargandoMas(false);
    }
  };

  const todas = useMemo(
    () => (resultado && !cargando ? resultado.series : []),
    [resultado, cargando],
  );

  const visibles = useMemo(() => {
    const consulta = searchTerm.trim().toLowerCase();

    if (!consulta) return todas;

    return todas.filter((serie) =>
      serie.name.toLowerCase().includes(consulta),
    );
  }, [todas, searchTerm]);

  const limpiar = () => setGenero("");

  return (
    <main className="mx-auto w-full max-w-[2200px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      {/* Filtros por género */}
      <section className="rounded-2xl border border-[#1c2840] bg-[#0a101d] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPanelAbierto((abierto) => !abierto)}
            aria-expanded={panelAbierto}
            className="flex items-center gap-2.5 text-left text-base font-bold text-white sm:text-lg"
          >
            <span
              aria-hidden="true"
              className={`inline-block text-cyan-400 transition-transform ${
                panelAbierto ? "" : "-rotate-90"
              }`}
            >
              ⌄
            </span>
            Géneros de series
          </button>

          <button
            type="button"
            onClick={limpiar}
            disabled={!genero}
            className="flex items-center gap-2 rounded-full border border-[#1c2840] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-blue-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
          >
            <span aria-hidden="true">↻</span>
            Limpiar filtros
          </button>
        </div>

        {panelAbierto && (
          <div className="mt-4 flex flex-wrap gap-2 sm:gap-2.5">
            {GENEROS.map((g) => {
              const activo = genero === g;

              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenero(activo ? "" : g)}
                  aria-pressed={activo}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                    activo
                      ? "border-[#2f6bff] bg-[#1a5cff] text-white"
                      : "border-[#1c2840] bg-[#0d1526] text-slate-200 hover:border-blue-500/70"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={ICONOS[g] ? "" : "opacity-70"}
                  >
                    {ICONOS[g] ?? "🎬"}
                  </span>
                  {g}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Título y contador */}
      <div className="mt-8 mb-5 flex items-end justify-between gap-3 sm:mt-10">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
          Series
          {genero && (
            <span className="ml-2 text-base font-semibold text-blue-400 sm:text-xl">
              · {genero}
            </span>
          )}
        </h1>

        {!cargando && !resultado?.error && (
          <span className="shrink-0 text-xs text-blue-300/80 sm:text-sm">
            Mostrando {visibles.length} de {todas.length}
          </span>
        )}
      </div>

      {/* Grilla adaptable a distintos tamaños de pantalla */}
      {cargando ? (
        <ul className={GRID}>
          {Array.from({ length: 10 }).map((_, i) => (
            <li
              key={i}
              className="aspect-[2/4] animate-pulse rounded-xl border border-[#1c2840] bg-[#0b1220] sm:rounded-2xl"
            />
          ))}
        </ul>
      ) : resultado?.error ? (
        <div className="rounded-2xl border border-[#1c2840] bg-[#0b1220] px-6 py-12 text-center">
          <p className="text-lg font-bold text-white">
            No pudimos cargar las series
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Revisá tu conexión e intentá de nuevo.
          </p>

          <button
            type="button"
            onClick={() => setIntento((n) => n + 1)}
            className="mt-5 rounded-xl bg-[#1a5cff] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#3b74ff]"
          >
            Reintentar
          </button>
        </div>
      ) : visibles.length === 0 ? (
        <div className="rounded-2xl border border-[#1c2840] bg-[#0b1220] px-6 py-12 text-center">
          <p className="text-lg font-bold text-white">
            No encontramos series
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Probá con otro género o con otra búsqueda.
          </p>

          {genero && (
            <button
              type="button"
              onClick={limpiar}
              className="mt-5 rounded-xl bg-[#1a5cff] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#3b74ff]"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <ul className={GRID}>
            {visibles.map((serie) => (
              <li key={serie.id}>
                <SerieCard serie={serie} />
              </li>
            ))}
          </ul>

          {resultado?.hayMas && !searchTerm.trim() && (
            <div className="mt-8 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={cargarMas}
                disabled={cargandoMas}
                className="rounded-xl bg-[#1a5cff] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#3b74ff] disabled:opacity-60"
              >
                {cargandoMas ? "Cargando..." : "Cargar más series"}
              </button>

              {errorMas && (
                <p className="text-xs text-red-400">
                  No se pudieron cargar más series. Probá de nuevo.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}

const GRID =
  "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-5 min-[1920px]:grid-cols-6 min-[1920px]:gap-6 min-[2560px]:grid-cols-7";