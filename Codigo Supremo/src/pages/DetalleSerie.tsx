import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSerie } from "../services/SeriesApi";
import type { SerieDetalle } from "../services/SeriesApi";

interface Estado {
  id: string;
  serie: SerieDetalle | null;
  error: boolean;
}

function fechaLegible(valor: string) {
  if (!valor) return "";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DetalleSerie() {
  const { id = "" } = useParams();
  const [estado, setEstado] = useState<Estado | null>(null);
  const [intento, setIntento] = useState(0);
  const [temporadaElegida, setTemporadaElegida] = useState<number | null>(null);

  const cargando = estado?.id !== `${id}|${intento}`;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  useEffect(() => {
    const ctrl = new AbortController();
    const clave = `${id}|${intento}`;

    getSerie(id, ctrl.signal)
      .then((serie) => setEstado({ id: clave, serie, error: false }))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setEstado({ id: clave, serie: null, error: true });
      });

    return () => ctrl.abort();
  }, [id, intento]);

  const serie = !cargando ? (estado?.serie ?? null) : null;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10 2xl:max-w-[1500px]">
      <Link
        to="/series"
        className="inline-flex items-center gap-1 text-sm font-medium text-blue-400 transition hover:text-blue-300 sm:text-base"
      >
        ← Volver al catálogo
      </Link>

      {cargando ? (
        <div className="mt-8 flex animate-pulse flex-col gap-8 md:flex-row">
          <div className="mx-auto aspect-[2/3] w-48 rounded-2xl bg-[#0b1220] sm:w-64 md:mx-0 md:w-72" />
          <div className="flex-1 space-y-4">
            <div className="h-4 w-24 rounded bg-[#0b1220]" />
            <div className="h-10 w-3/4 rounded bg-[#0b1220]" />
            <div className="h-4 w-40 rounded bg-[#0b1220]" />
            <div className="h-24 w-full rounded bg-[#0b1220]" />
          </div>
        </div>
      ) : !serie ? (
        <div className="mt-8 rounded-2xl border border-[#1c2840] bg-[#0b1220] px-6 py-12 text-center">
          <p className="text-lg font-bold text-white">
            No pudimos cargar esta serie
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Puede que no exista o que haya un problema de conexión.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setIntento((n) => n + 1)}
              className="rounded-xl bg-[#1a5cff] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#3b74ff]"
            >
              Reintentar
            </button>
            <Link
              to="/series"
              className="rounded-xl border border-[#1c2840] px-6 py-2.5 text-sm font-bold text-slate-200 transition hover:border-blue-500"
            >
              Ver series
            </Link>
          </div>
        </div>
      ) : (
        <Contenido
          serie={serie}
          temporadaElegida={temporadaElegida}
          onTemporada={setTemporadaElegida}
        />
      )}
    </main>
  );
}

interface ContenidoProps {
  serie: SerieDetalle;
  temporadaElegida: number | null;
  onTemporada: (n: number) => void;
}

function Contenido({ serie, temporadaElegida, onTemporada }: ContenidoProps) {
  const primera =
    serie.temporadas.find((t) => t > 0) ?? serie.temporadas[0] ?? null;
  const temporada =
    temporadaElegida !== null && serie.temporadas.includes(temporadaElegida)
      ? temporadaElegida
      : primera;

  const episodios =
    temporada === null
      ? []
      : serie.episodios.filter((e) => e.season === temporada);

  return (
    <>
      <section className="mt-6 flex flex-col gap-6 sm:mt-8 sm:gap-8 md:flex-row md:gap-10">
        <img
          src={serie.poster}
          alt={`Póster de ${serie.name}`}
          className="mx-auto aspect-[2/3] w-48 rounded-2xl object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:w-64 md:mx-0 md:w-72 lg:w-80 2xl:w-96"
        />

        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold tracking-wider text-blue-500 uppercase sm:text-sm">
            Serie
          </p>

          <h1 className="mt-2 text-3xl leading-tight font-extrabold text-white sm:text-4xl lg:text-5xl">
            {serie.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400 sm:text-base">
            {serie.year && <span>{serie.year}</span>}
            {serie.rating && (
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="text-amber-400">★</span>
                {serie.rating}
              </span>
            )}
            {serie.temporadas.filter((t) => t > 0).length > 0 && (
              <span>
                {serie.temporadas.filter((t) => t > 0).length}{" "}
                {serie.temporadas.filter((t) => t > 0).length === 1
                  ? "temporada"
                  : "temporadas"}
              </span>
            )}
            {serie.runtime && <span>{serie.runtime}</span>}
          </div>

          <h2 className="mt-6 text-lg font-bold text-white sm:mt-8 sm:text-xl">
            Sinopsis
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {serie.description || "Esta serie todavía no tiene sinopsis."}
          </p>

          {serie.genres.length > 0 && (
            <>
              <h2 className="mt-6 text-lg font-bold text-white sm:mt-8 sm:text-xl">
                Géneros
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {serie.genres.map((g) => (
                  <Link
                    key={g}
                    to="/series"
                    className="rounded-full border border-[#1f3a7a] bg-[#0d1a38] px-4 py-1.5 text-xs font-medium text-blue-300 transition hover:border-blue-400 sm:text-sm"
                  >
                    {g}
                  </Link>
                ))}
              </div>
            </>
          )}

          {serie.cast.length > 0 && (
            <>
              <h2 className="mt-6 text-lg font-bold text-white sm:mt-8 sm:text-xl">
                Reparto
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                {serie.cast.slice(0, 8).join(", ")}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Temporadas y episodios */}
      {serie.temporadas.length > 0 && temporada !== null && (
        <section className="mt-10 sm:mt-14">
          <h2 className="text-xl font-extrabold text-white sm:text-2xl">
            Episodios
          </h2>

          <div
            role="tablist"
            aria-label="Temporadas"
            className="mt-4 flex gap-2 overflow-x-auto pb-2"
          >
            {serie.temporadas.map((t) => {
              const activa = t === temporada;
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={activa}
                  onClick={() => onTemporada(t)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition sm:text-sm ${
                    activa
                      ? "border-[#2f6bff] bg-[#1a5cff] text-white"
                      : "border-[#1c2840] bg-[#0d1526] text-slate-200 hover:border-blue-500/70"
                  }`}
                >
                  {t === 0 ? "Especiales" : `Temporada ${t}`}
                </button>
              );
            })}
          </div>

          <ul className="mt-4 grid gap-3 lg:grid-cols-2">
            {episodios.map((ep) => (
              <li
                key={ep.id}
                className="flex gap-3 rounded-xl border border-[#1c2840] bg-[#0b1220] p-2.5 sm:gap-4 sm:p-3"
              >
                <div className="aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-[#0a1020] sm:w-44">
                  {ep.image && (
                    <img
                      src={ep.image}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.visibility = "hidden";
                      }}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-blue-400 sm:text-xs">
                    E{ep.number}
                    {fechaLegible(ep.released) &&
                      ` · ${fechaLegible(ep.released)}`}
                  </p>
                  <h3 className="line-clamp-1 text-sm font-bold text-white sm:text-base">
                    {ep.name || `Episodio ${ep.number}`}
                  </h3>
                  {ep.overview && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400 sm:line-clamp-3 sm:text-sm">
                      {ep.overview}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
