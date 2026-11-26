
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerCatalogo } from "../services/peliculas";
import type { Contenido } from "../services/peliculas";
import { obtenerCambios } from "../services/almacenamiento";
import { mapContenido } from "../services/MapContenido";
import { plans } from "../Data/Plans";

export const Bienvenida = () => {
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
        console.error("Error al cargar el contenido:", error);
      } finally {
        if (activa) setCargando(false);
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

    window.addEventListener("catalogo-actualizado", actualizarCatalogo);
    window.addEventListener("storage", detectarCambiosEntrePestanas);

    void cargarCatalogos();

    return () => {
      activa = false;
      window.removeEventListener("catalogo-actualizado", actualizarCatalogo);
      window.removeEventListener("storage", detectarCambiosEntrePestanas);
    };
  }, []);

  const mostrarContenido = (
    titulo: string,
    contenido: Contenido[]
  ) => (
    <section className="mx-auto max-w-7xl px-6 py-10 md:px-10">
      <h2 className="mb-6 text-2xl font-bold md:text-3xl">{titulo}</h2>

      {contenido.length === 0 ? (
        <p className="text-slate-400">
          Todavía no hay contenido para mostrar.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {contenido.slice(0, 5).map((item) => {
            const pelicula = mapContenido(item);

            return (
              <a
                key={item.id}
                href="#registro"
                aria-label={`Ir al registro para disfrutar de ${pelicula.name}`}
                className="group overflow-hidden rounded-xl border border-slate-800 bg-[#0b1220] transition hover:-translate-y-1 hover:border-blue-500"
              >
                {pelicula.image ? (
                  <img
                    src={pelicula.image}
                    alt={`Póster de ${pelicula.name}`}
                    loading="lazy"
                    className="aspect-[2/3] w-full object-cover transition group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center bg-slate-800 p-4 text-center text-slate-400">
                    Sin póster
                  </div>
                )}

                <div className="p-3">
                  <h3 className="line-clamp-2 font-semibold text-white">
                    {pelicula.name || "Sin título"}
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    {pelicula.year || "Año desconocido"}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      {/* Presentación */}
      <section className="relative overflow-hidden px-6 py-24 text-center md:py-32">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <p className="mb-4 font-bold uppercase tracking-[0.25em] text-cyan-400">
            Bienvenido a CineRolling
          </p>

          <h1 className="text-4xl font-black leading-tight md:text-6xl">
            Tus próximas historias favoritas te esperan.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">
            Descubrí películas y series para disfrutar cuando quieras.
            Creá tu cuenta y preparate para una nueva historia.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="rounded-full bg-blue-500 px-7 py-3 font-bold text-white transition hover:bg-blue-400"
            >
              Crear mi cuenta
            </Link>

            <a
              href="#peliculas"
              className="rounded-full border border-slate-600 px-7 py-3 font-bold transition hover:border-cyan-400 hover:text-cyan-400"
            >
              Descubrir CineRolling
            </a>
          </div>
        </div>
      </section>

      {/* Muestra de películas y series */}
      {cargando ? (
        <p className="px-6 py-10 text-center text-slate-400">
          Cargando películas y series...
        </p>
      ) : (
        <>
          <div id="peliculas">
            {mostrarContenido("Películas destacadas", peliculas)}
          </div>

          {mostrarContenido("Series destacadas", series)}
        </>
      )}

      {/* Planes */}
      <section id="planes" className="mx-auto max-w-6xl px-6 py-16">
  <div className="mb-10 text-center">
    <p className="mb-3 font-bold uppercase tracking-widest text-cyan-400">
      Elegí cómo disfrutar
    </p>

    <h2 className="text-3xl font-black md:text-4xl">
      Encontrá tu plan ideal
    </h2>

    <p className="mx-auto mt-4 max-w-xl text-slate-400">
      Elegí el plan que mejor se adapte a vos y empezá tu experiencia.
    </p>
  </div>

  <div className="grid gap-6 md:grid-cols-3">
    {plans.map((plan) => (
      <article
        key={plan.id}
        className={`flex flex-col rounded-2xl border bg-[#0b1220] p-6 transition hover:-translate-y-1 hover:border-blue-500 ${
          plan.id === "estandar"
            ? "border-blue-500 shadow-lg shadow-blue-500/10"
            : "border-slate-800"
        }`}
      >
        {plan.id === "estandar" && (
          <span className="mb-4 w-fit rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-cyan-400">
            RECOMENDADO
          </span>
        )}

        <h3 className="text-2xl font-bold">{plan.name}</h3>

        <p className="mt-3 text-sm text-slate-400">
          {plan.description}
        </p>

        <p className="mt-6 text-3xl font-black text-cyan-400">
          {plan.price}
        </p>

        <ul className="mt-6 flex-1 space-y-3">
          {plan.benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex gap-2 text-sm text-slate-300"
            >
              <span className="text-cyan-400">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </article>
    ))}
  </div>
</section>

      {/* Registro al final de la página */}
      <section
        id="registro"
        className="mx-6 mb-16 rounded-3xl border border-slate-800 bg-gradient-to-r from-[#0b1220] to-[#111d35] px-6 py-12 text-center md:mx-auto md:max-w-6xl md:px-12"
      >
        <h2 className="text-3xl font-black md:text-4xl">
          ¿Listo para empezar?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Creá tu cuenta y preparate para descubrir tu próxima historia favorita.
        </p>

        <Link
          to="/register"
          className="mt-7 inline-block rounded-full bg-blue-500 px-7 py-3 font-bold transition hover:bg-blue-400"
        >
          Registrarme
        </Link>
      </section>
    </main>
  );
};
