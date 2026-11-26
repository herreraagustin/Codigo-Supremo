
import {
  useEffect,
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import { obtenerCatalogo } from "../services/peliculas";
import type { Contenido } from "../services/peliculas";
import { obtenerCambios, guardarCambios } from "../services/almacenamiento";
import { CardAdmin } from "../components/CardAdmin";

function obtenerGenerosDeSerie(serie: Contenido): string[] {
  const resultado: string[] = [];

  const agregar = (valor: unknown) => {
    let lista: string[] = [];

    if (Array.isArray(valor)) {
      lista = valor.filter((item): item is string => typeof item === "string");
    } else if (typeof valor === "string") {
      lista = valor.split(/[|,]/);
    }

    lista.forEach((genero) => {
      const limpio = genero.trim();

      if (
        limpio &&
        !resultado.some(
          (existente) =>
            existente.toLocaleLowerCase() === limpio.toLocaleLowerCase(),
        )
      ) {
        resultado.push(limpio);
      }
    });
  };

  agregar(serie.genres);
  agregar(serie["genre"]);

  return resultado;
}

function normalizarTitulo(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function obtenerAnioDeSerie(serie: Contenido): number {
  const datos = serie as Contenido & {
    first_air_date?: string;
    firstAirDate?: string;
    release_date?: string;
    releaseDate?: string;
    year?: number | string;
  };

  const valor =
    datos.year ??
    datos.first_air_date ??
    datos.firstAirDate ??
    datos.release_date ??
    datos.releaseDate ??
    "";

  const coincidencia = String(valor).match(
    /\b(18\d{2}|19\d{2}|20\d{2}|2100)\b/,
  );

  return coincidencia ? Number(coincidencia[0]) : 0;
}

function esLaMismaSerie(
  existente: Contenido,
  tituloNuevo: string,
  anioNuevo: number,
): boolean {
  const tituloExistente = normalizarTitulo(
    String(existente.name ?? existente.title ?? ""),
  );

  return (
    tituloExistente !== "" &&
    tituloExistente === normalizarTitulo(tituloNuevo) &&
    obtenerAnioDeSerie(existente) === anioNuevo
  );
}

export const AdminSeries = () => {
  const [series, setSeries] = useState<Contenido[]>([]);
  const [generosDisponibles, setGenerosDisponibles] = useState<string[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [intentoGuardar, setIntentoGuardar] = useState(false);
  const [idConfirmarBorrado, setIdConfirmarBorrado] = useState<string | null>(
    null,
  );
  const [serieEditando, setSerieEditando] = useState<Contenido | null>(null);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [anio, setAnio] = useState("");
  const [calificacion, setCalificacion] = useState(0);
  const [poster, setPoster] = useState("");
  const [imagenArchivo, setImagenArchivo] = useState("");
  const [errorImagen, setErrorImagen] = useState("");
  const [imagenUrlValida, setImagenUrlValida] = useState(false);

  const archivoRef = useRef<HTMLInputElement>(null);

  const tituloValido = titulo.trim().length > 0;
  const descripcionValida = descripcion.trim().length > 0;

  const anioValido =
    anio.trim() !== "" &&
    /^\d{4}$/.test(anio) &&
    Number(anio) >= 1888 &&
    Number(anio) <= 2100;

  const calificacionValida =
    Number.isInteger(calificacion) && calificacion >= 1 && calificacion <= 5;

  const generosValidos = generos.some((genero) => genero.trim() !== "");

  useEffect(() => {
    const cargarSeries = async () => {
      try {
        setCargando(true);
        setError("");

        const catalogo = await obtenerCatalogo("series");
        const cambios = obtenerCambios();

        const listaGeneros = catalogo.flatMap(obtenerGenerosDeSerie);
        const unicos = Array.from(
          new Map(
            listaGeneros.map((g) => [g.toLocaleLowerCase(), g]),
          ).values(),
        ).sort((a, b) => a.localeCompare(b));

        setGenerosDisponibles(unicos);

        const originales = catalogo
          .filter((serie) => !cambios.eliminadas.series.includes(serie.id))
          .map((serie) => {
            const editada = cambios.editadas.series.find(
              (item) => item.id === serie.id,
            );

            return editada ?? serie;
          });

        const idsOriginales = new Set(originales.map((serie) => serie.id));

        const agregadas = cambios.agregadas.series
          .filter((serie) => !cambios.eliminadas.series.includes(serie.id))
          .filter((serie) => !idsOriginales.has(serie.id))
          .slice()
          .reverse();

        setSeries([...agregadas, ...originales]);
      } catch (error) {
        console.error("Error al cargar las series:", error);
        setError("No se pudieron cargar las series ni sus géneros.");
      } finally {
        setCargando(false);
      }
    };

    void cargarSeries();
  }, []);

  useEffect(() => {
    if (!mostrarModal) return;

    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        limpiarFormulario();
        setMostrarModal(false);
      }
    };

    window.addEventListener("keydown", cerrarConEscape);

    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [mostrarModal]);

  const alternarGenero = (genero: string) => {
    setGeneros((actuales) =>
      actuales.some((g) => g.toLocaleLowerCase() === genero.toLocaleLowerCase())
        ? actuales.filter(
            (g) => g.toLocaleLowerCase() !== genero.toLocaleLowerCase(),
          )
        : [...actuales, genero],
    );

    setErrorFormulario("");
  };

  const seleccionarImagen = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];

    if (!archivo) return;

    setErrorImagen("");
    setImagenUrlValida(false);

    if (!archivo.type.startsWith("image/")) {
      setErrorImagen("El archivo seleccionado no es una imagen.");
      evento.target.value = "";
      return;
    }

    if (archivo.size > 1024 * 1024) {
      setErrorImagen("La imagen no puede superar 1 MB.");
      evento.target.value = "";
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {
      if (typeof lector.result === "string") {
        setImagenArchivo(lector.result);
        setPoster("");
        setErrorImagen("");
      }
    };

    lector.onerror = () => {
      setErrorImagen("No se pudo leer la imagen seleccionada.");
    };

    lector.readAsDataURL(archivo);
  };

  const quitarImagen = () => {
    setImagenArchivo("");
    setPoster("");
    setErrorImagen("");
    setImagenUrlValida(false);

    if (archivoRef.current) archivoRef.current.value = "";
  };

  const limpiarFormulario = () => {
    setTitulo("");
    setDescripcion("");
    setAnio("");
    setGeneros([]);
    setCalificacion(0);
    setPoster("");
    setImagenArchivo("");
    setErrorFormulario("");
    setErrorImagen("");
    setImagenUrlValida(false);
    setIntentoGuardar(false);
    setSerieEditando(null);

    if (archivoRef.current) archivoRef.current.value = "";
  };

  const abrirEdicion = (serie: Contenido) => {
    const nombre = String(serie.name ?? serie.title ?? "");
    const sinopsis = String(serie.description ?? serie.overview ?? "");
    const notaRating = Number(serie.rating);
    const notaImdb = Number(
      String(serie.imdbRating ?? "").replace(",", ".").split("/")[0],
    );

    let nota = notaRating > 0 ? notaRating : notaImdb;

    if (nota > 5) nota = nota / 2;

    limpiarFormulario();
    setSerieEditando(serie);
    setTitulo(nombre);
    setDescripcion(sinopsis);
    setAnio(String(obtenerAnioDeSerie(serie) || ""));
    setGeneros(obtenerGenerosDeSerie(serie));
    setCalificacion(
      Number.isFinite(nota) ? Math.min(5, Math.max(0, Math.round(nota))) : 0,
    );
    setPoster(String(serie.poster ?? serie.backdrop ?? ""));
    setMostrarModal(true);
  };

  const guardarSerie = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setIntentoGuardar(true);
    setErrorFormulario("");

    const nombreLimpio = titulo.trim();
    const sinopsisLimpia = descripcion.trim();
    const anioNuevo = Number(anio);

    if (
      !tituloValido ||
      !descripcionValida ||
      !anioValido ||
      !calificacionValida ||
      !generosValidos
    ) {
      return;
    }

    try {
      const cambios = obtenerCambios();

      const duplicada = series.some(
        (serie) =>
          serie.id !== serieEditando?.id &&
          esLaMismaSerie(serie, nombreLimpio, anioNuevo),
      );

      if (duplicada) {
        setErrorFormulario(
          `Ya existe "${nombreLimpio}" (${anioNuevo}) en el catálogo. No podés agregarla otra vez.`,
        );
        return;
      }

      const datosSerie: Contenido = {
        ...(serieEditando ?? {}),
        id: serieEditando?.id ?? `local-series-${Date.now()}`,
        name: nombreLimpio,
        title: nombreLimpio,
        description: sinopsisLimpia,
        overview: sinopsisLimpia,
        year: anioNuevo,
        genres: [...generos],
        imdbRating: `${calificacion}/5`,
        rating: calificacion,
        poster: imagenArchivo || poster.trim(),
        type: "series",
      };

      if (serieEditando) {
        const esLocal = cambios.agregadas.series.some(
          (serie) => serie.id === serieEditando.id,
        );

        if (esLocal) {
          cambios.agregadas.series = cambios.agregadas.series.map((serie) =>
            serie.id === serieEditando.id ? datosSerie : serie,
          );
        } else {
          cambios.editadas.series = [
            ...cambios.editadas.series.filter(
              (serie) => serie.id !== serieEditando.id,
            ),
            datosSerie,
          ];
        }
      } else {
        cambios.agregadas.series = [datosSerie, ...cambios.agregadas.series];
      }

      guardarCambios(cambios);

      const guardadas = obtenerCambios();
      const guardada = serieEditando
        ? guardadas.agregadas.series.some(
            (serie) => serie.id === datosSerie.id,
          ) ||
          guardadas.editadas.series.some((serie) => serie.id === datosSerie.id)
        : guardadas.agregadas.series.some(
            (serie) => serie.id === datosSerie.id,
          );

      if (!guardada) {
        setErrorFormulario(
          "La serie no quedó guardada. Revisá el almacenamiento del navegador.",
        );
        return;
      }

      setSeries((actuales) =>
        serieEditando
          ? actuales.map((serie) =>
              serie.id === datosSerie.id ? datosSerie : serie,
            )
          : [datosSerie, ...actuales],
      );

      limpiarFormulario();
      setBusqueda("");
      setMostrarModal(false);
      setError("");
    } catch (error) {
      console.error("Error al guardar la serie:", error);
      setErrorFormulario(
        "No se pudo guardar la serie. Revisá el almacenamiento disponible.",
      );
    }
  };

  const borrarSerie = (serie: Contenido) => {
    try {
      const cambios = obtenerCambios();
      const esLocal = cambios.agregadas.series.some((s) => s.id === serie.id);

      if (esLocal) {
        cambios.agregadas.series = cambios.agregadas.series.filter(
          (s) => s.id !== serie.id,
        );
      } else if (!cambios.eliminadas.series.includes(serie.id)) {
        cambios.eliminadas.series = [...cambios.eliminadas.series, serie.id];
      }

      cambios.editadas.series = cambios.editadas.series.filter(
        (s) => s.id !== serie.id,
      );

      guardarCambios(cambios);
      setSeries((actuales) => actuales.filter((s) => s.id !== serie.id));
      setIdConfirmarBorrado(null);
      setError("");
    } catch (error) {
      console.error("Error al borrar la serie:", error);
      setError("No se pudo borrar la serie.");
    }
  };

  const seriesFiltradas = series.filter((serie) =>
    (serie.name ?? serie.title ?? "")
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  const avisoPendiente = (valido: boolean, mensaje: string) =>
    intentoGuardar && !valido ? (
      <p role="alert" className="mt-1 text-sm leading-relaxed text-amber-400">
        {mensaje}
      </p>
    ) : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-950 px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <Link
              to="/admin"
              className="mb-3 inline-flex min-h-10 items-center rounded-lg py-2 pr-3 text-sm text-blue-400 transition hover:text-blue-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              ← Volver al panel
            </Link>

            <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
              Administrar series
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-gray-400 sm:text-base">
              Agregá, buscá, editá y eliminá series del catálogo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              limpiarFormulario();
              setMostrarModal(true);
            }}
            className="w-full shrink-0 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 sm:w-auto sm:text-base"
          >
            + Agregar serie
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 break-words rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm leading-relaxed text-red-300 sm:text-base"
          >
            {error}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="buscar-serie" className="sr-only">
            Buscar serie por nombre
          </label>

          <input
            id="buscar-serie"
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar serie por nombre..."
            className="w-full min-w-0 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-base text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />

          <p className="mt-3 text-sm text-gray-400" aria-live="polite">
            {seriesFiltradas.length}{" "}
            {seriesFiltradas.length === 1
              ? "serie encontrada"
              : "series encontradas"}
          </p>
        </div>

        {cargando ? (
          <p
            className="py-12 text-center text-gray-400"
            role="status"
          >
            Cargando series...
          </p>
        ) : seriesFiltradas.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-10 text-center sm:px-6">
            <p className="text-base text-gray-300">
              {busqueda.trim()
                ? "No se encontraron series con ese nombre."
                : "Todavía no hay series para mostrar."}
            </p>

            {busqueda.trim() && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="mt-3 rounded-lg px-3 py-2 text-sm text-blue-300 underline underline-offset-4 hover:text-blue-200"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
            {seriesFiltradas.map((serie) => {
              const generosSerie = obtenerGenerosDeSerie(serie);

              const notaRating = Number(serie.rating);
              const notaImdb = Number(
                String(serie.imdbRating ?? "").replace(",", ".").split("/")[0],
              );

              const notaOriginal =
                Number.isFinite(notaRating) && notaRating > 0
                  ? notaRating
                  : notaImdb;

              const nota = Math.min(
                5,
                Math.max(
                  0,
                  Math.round(notaOriginal > 5 ? notaOriginal / 2 : notaOriginal),
                ),
              );

              return (
                <CardAdmin
                  key={serie.id}
                  contenido={serie}
                  tipo="series"
                  nota={nota}
                  generos={generosSerie}
                  confirmarBorrado={idConfirmarBorrado === serie.id}
                  onEditar={abrirEdicion}
                  onSolicitarBorrado={setIdConfirmarBorrado}
                  onConfirmarBorrado={() => borrarSerie(serie)}
                  onCancelarBorrado={() => setIdConfirmarBorrado(null)}
                />
              );
            })}
          </div>
        )}
      </div>

      {mostrarModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/80 p-3 sm:items-center sm:p-5"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              limpiarFormulario();
              setMostrarModal(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-serie"
            className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-2xl sm:max-h-[90dvh]"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-800 px-4 py-4 sm:px-6">
              <h2
                id="titulo-modal-serie"
                className="min-w-0 text-lg font-bold sm:text-2xl"
              >
                {serieEditando ? "Editar serie" : "Agregar serie"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  limpiarFormulario();
                  setMostrarModal(false);
                }}
                aria-label="Cerrar formulario"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-2xl text-gray-400 transition hover:bg-gray-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={guardarSerie}
              noValidate
              className="min-h-0 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
            >
              {errorFormulario && (
                <p
                  role="alert"
                  className="break-words rounded-lg border border-red-800 bg-red-950 p-3 text-sm leading-relaxed text-red-300"
                >
                  {errorFormulario}
                </p>
              )}

              <div>
                <label
                  htmlFor="titulo-serie"
                  className="mb-2 block text-sm font-medium sm:text-base"
                >
                  Título <span className="text-red-400">*</span>
                </label>

                <input
                  id="titulo-serie"
                  type="text"
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    setErrorFormulario("");
                  }}
                  className="w-full min-w-0 rounded-lg border border-gray-700 bg-gray-800 px-3 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 sm:px-4"
                  placeholder="Nombre de la serie"
                />

                {avisoPendiente(tituloValido, "Falta agregar el título.")}
              </div>

              <div>
                <label
                  htmlFor="descripcion-serie"
                  className="mb-2 block text-sm font-medium sm:text-base"
                >
                  Sinopsis <span className="text-red-400">*</span>
                </label>

                <textarea
                  id="descripcion-serie"
                  rows={4}
                  value={descripcion}
                  onChange={(e) => {
                    setDescripcion(e.target.value);
                    setErrorFormulario("");
                  }}
                  className="w-full min-w-0 resize-y rounded-lg border border-gray-700 bg-gray-800 px-3 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 sm:px-4"
                  placeholder="¿De qué trata la serie?"
                />

                {avisoPendiente(
                  descripcionValida,
                  "Falta agregar la sinopsis.",
                )}
              </div>

              <div>
                <label
                  htmlFor="anio-serie"
                  className="mb-2 block text-sm font-medium sm:text-base"
                >
                  Año <span className="text-red-400">*</span>
                </label>

                <input
                  id="anio-serie"
                  type="number"
                  inputMode="numeric"
                  min="1888"
                  max="2100"
                  value={anio}
                  onChange={(e) => {
                    setAnio(e.target.value);
                    setErrorFormulario("");
                  }}
                  className="w-full min-w-0 rounded-lg border border-gray-700 bg-gray-800 px-3 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 sm:px-4"
                  placeholder="Ej.: 2026"
                />

                {avisoPendiente(
                  anioValido,
                  "Ingresá un año válido entre 1888 y 2100.",
                )}
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-medium sm:text-base">
                  Calificación <span className="text-red-400">*</span>
                </legend>

                <div className="flex flex-wrap items-center gap-1">
                  {[1, 2, 3, 4, 5].map((estrella) => (
                    <button
                      key={estrella}
                      type="button"
                      onClick={() => {
                        setCalificacion(estrella);
                        setErrorFormulario("");
                      }}
                      aria-label={`${estrella} ${
                        estrella === 1 ? "estrella" : "estrellas"
                      }`}
                      aria-pressed={calificacion === estrella}
                      className={`flex h-11 w-10 items-center justify-center rounded-md text-3xl transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                        estrella <= calificacion
                          ? "text-yellow-400"
                          : "text-gray-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}

                  {calificacion > 0 && (
                    <>
                      <span className="ml-2 text-sm text-gray-400">
                        {calificacion} de 5
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setCalificacion(0);
                          setErrorFormulario("");
                        }}
                        className="ml-2 rounded px-2 py-2 text-xs text-blue-300 hover:underline"
                      >
                        Quitar
                      </button>
                    </>
                  )}
                </div>

                {avisoPendiente(
                  calificacionValida,
                  "Seleccioná al menos una estrella.",
                )}
              </fieldset>

              <fieldset>
                <legend className="mb-3 text-sm font-medium sm:text-base">
                  Géneros <span className="text-red-400">*</span>
                </legend>

                {generosDisponibles.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {generosDisponibles.map((genero) => {
                        const seleccionado = generos.some(
                          (g) =>
                            g.toLocaleLowerCase() ===
                            genero.toLocaleLowerCase(),
                        );

                        return (
                          <button
                            key={genero}
                            type="button"
                            onClick={() => alternarGenero(genero)}
                            aria-pressed={seleccionado}
                            className={`max-w-full rounded-full border px-3 py-2 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                              seleccionado
                                ? "border-blue-400 bg-blue-600 text-white"
                                : "border-gray-600 bg-gray-800 text-gray-300 hover:border-blue-500"
                            }`}
                          >
                            {seleccionado ? "✓ " : ""}
                            {genero}
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-3 break-words text-sm leading-relaxed text-gray-400">
                      Seleccionados:{" "}
                      {generosValidos ? generos.join(" · ") : "Ninguno"}
                    </p>
                  </>
                ) : (
                  <p className="rounded-lg border border-yellow-800 bg-yellow-950/40 p-3 text-sm leading-relaxed text-yellow-200">
                    La API no devolvió géneros para este catálogo.
                  </p>
                )}

                {avisoPendiente(
                  generosValidos,
                  "Falta agregar o seleccionar al menos un género.",
                )}
              </fieldset>

              <div className="min-w-0">
                <label
                  htmlFor="archivo-poster-serie"
                  className="mb-2 block text-sm font-medium sm:text-base"
                >
                  Imagen del póster (opcional)
                </label>

                <p className="mb-3 text-sm leading-relaxed text-gray-400">
                  Elegí una imagen de tu computadora o pegá una URL directa. Los
                  archivos locales pueden pesar hasta 1 MB.
                </p>

                <input
                  ref={archivoRef}
                  id="archivo-poster-serie"
                  type="file"
                  accept="image/*"
                  onChange={seleccionarImagen}
                  className="block w-full min-w-0 rounded-lg border border-gray-700 bg-gray-800 p-3 text-sm file:mr-3 file:max-w-full file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white"
                />

                {errorImagen && !poster.trim() && !imagenArchivo && (
                  <p role="alert" className="mt-2 text-sm text-red-300">
                    {errorImagen}
                  </p>
                )}

                <label
                  htmlFor="url-poster-serie"
                  className="mb-2 mt-4 block text-sm font-medium"
                >
                  O pegá la URL de la imagen
                </label>

                <input
                  id="url-poster-serie"
                  type="url"
                  value={poster}
                  onChange={(e) => {
                    setPoster(e.target.value);
                    setImagenArchivo("");
                    setErrorImagen("");
                    setImagenUrlValida(false);

                    if (archivoRef.current) {
                      archivoRef.current.value = "";
                    }
                  }}
                  className="block w-full min-w-0 rounded-lg border border-gray-700 bg-gray-800 px-3 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 sm:px-4"
                  placeholder="https://ejemplo.com/poster.jpg"
                />

                {(imagenArchivo || poster.trim()) && (
                  <div className="mt-4 min-w-0 overflow-hidden rounded-lg border border-gray-700 bg-gray-800 p-3">
                    <p className="mb-3 text-sm text-gray-300">
                      Vista previa
                    </p>

                    <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-lg bg-gray-950 sm:h-64">
                      <img
                        key={imagenArchivo || poster.trim()}
                        src={imagenArchivo || poster.trim()}
                        alt="Vista previa del póster"
                        className="block h-full w-full object-contain"
                        onLoad={() => {
                          setImagenUrlValida(true);
                          setErrorImagen("");
                        }}
                        onError={() => {
                          setImagenUrlValida(false);
                          setErrorImagen(
                            "No se pudo mostrar la imagen. Revisá que la URL sea directa a un archivo de imagen.",
                          );
                        }}
                      />
                    </div>

                    {errorImagen && (
                      <p role="alert" className="mt-2 text-sm text-red-300">
                        {errorImagen}
                      </p>
                    )}

                    {imagenUrlValida && (
                      <p className="mt-2 text-sm text-green-400">
                        Imagen cargada correctamente.
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={quitarImagen}
                      className="mt-3 w-full rounded-lg bg-red-600/20 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      Quitar imagen
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-800 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    limpiarFormulario();
                    setMostrarModal(false);
                  }}
                  className="w-full rounded-lg bg-gray-700 px-4 py-3 font-semibold transition hover:bg-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 sm:w-auto sm:min-w-32"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:w-auto sm:min-w-40"
                >
                  {serieEditando ? "Guardar cambios" : "Guardar serie"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
};
