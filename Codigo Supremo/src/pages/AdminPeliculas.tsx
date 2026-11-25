
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CardAdmin } from "../components/CardAdmin";
import { obtenerCatalogo } from "../services/peliculas";
import type { Contenido } from "../services/peliculas";
import { obtenerCambios, guardarCambios } from "../services/almacenamiento";

function normalizarTitulo(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase();
}

function obtenerGenerosDePelicula(pelicula: Contenido): string[] {
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
          (g) => g.toLocaleLowerCase() === limpio.toLocaleLowerCase(),
        )
      ) {
        resultado.push(limpio);
      }
    });
  };

  agregar(pelicula.genres);
  agregar(pelicula["genre"]);

  return resultado;
}

function convertirNota(valor: unknown, escalaPorDefecto: number): number {
  if (typeof valor !== "number" && typeof valor !== "string") {
    return 0;
  }

  const texto = String(valor).trim().replace(",", ".");
  const coincidencia = texto.match(
    /^(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+(?:\.\d+))?)?$/,
  );

  if (!coincidencia) return 0;

  const numero = Number(coincidencia[1]);
  const escala = coincidencia[2] ? Number(coincidencia[2]) : escalaPorDefecto;

  if (
    !Number.isFinite(numero) ||
    !Number.isFinite(escala) ||
    escala <= 0 ||
    numero < 0 ||
    numero > escala
  ) {
    return 0;
  }

  return Math.max(0, Math.min(5, Math.round((numero / escala) * 5)));
}

function obtenerNota(pelicula: Contenido): number {
  const nota = convertirNota(pelicula.rating, 5);

  if (nota > 0) return nota;

  return convertirNota(pelicula.imdbRating, 10);
}

export const AdminPeliculas = () => {
  const [peliculas, setPeliculas] = useState<Contenido[]>([]);
  const [generosDisponibles, setGenerosDisponibles] = useState<string[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);
  const [nuevoGenero, setNuevoGenero] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [intentoGuardar, setIntentoGuardar] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [idConfirmarBorrado, setIdConfirmarBorrado] = useState<string | null>(
    null,
  );
  const [peliculaEditando, setPeliculaEditando] = useState<Contenido | null>(
    null,
  );

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [anio, setAnio] = useState("");
  const [calificacion, setCalificacion] = useState(0);
  const [poster, setPoster] = useState("");
  const [imagenArchivo, setImagenArchivo] = useState("");

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
    async function cargarPeliculas() {
      try {
        setCargando(true);
        setError("");

        const datos = await obtenerCatalogo("movie");
        const cambios = obtenerCambios();

        const listaGeneros = datos.flatMap(obtenerGenerosDePelicula);

        const unicos = Array.from(
          new Map(
            listaGeneros.map((genero) => [genero.toLocaleLowerCase(), genero]),
          ).values(),
        ).sort((a, b) => a.localeCompare(b));

        setGenerosDisponibles(unicos);

        const idsEliminados = cambios.eliminadas.movie;
        const idsAgregados = cambios.agregadas.movie.map((p) => p.id);

        const originales = datos
          .filter(
            (pelicula) =>
              !idsEliminados.includes(pelicula.id) &&
              !idsAgregados.includes(pelicula.id),
          )
          .map((pelicula) => {
            const editada = cambios.editadas.movie.find(
              (item) => item.id === pelicula.id,
            );

            return editada ?? pelicula;
          });

        setPeliculas([
          ...cambios.agregadas.movie.slice().reverse(),
          ...originales,
        ]);
      } catch (error) {
        console.error("Error al cargar las películas:", error);
        setError("No se pudieron cargar las películas ni sus géneros.");
      } finally {
        setCargando(false);
      }
    }

    void cargarPeliculas();
  }, []);

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

  const agregarGeneroPersonalizado = () => {
    const limpio = nuevoGenero.trim();

    if (!limpio) {
      setErrorFormulario("Escribí el nombre del género que querés agregar.");
      return;
    }

    const existente = generosDisponibles.find(
      (genero) => genero.toLocaleLowerCase() === limpio.toLocaleLowerCase(),
    );

    const generoFinal = existente || limpio;

    setGenerosDisponibles((actuales) => {
      if (
        actuales.some(
          (genero) => genero.toLocaleLowerCase() === limpio.toLocaleLowerCase(),
        )
      ) {
        return actuales;
      }

      return [...actuales, limpio].sort((a, b) => a.localeCompare(b));
    });

    setGeneros((actuales) =>
      actuales.some(
        (genero) =>
          genero.toLocaleLowerCase() === generoFinal.toLocaleLowerCase(),
      )
        ? actuales
        : [...actuales, generoFinal],
    );

    setNuevoGenero("");
    setErrorFormulario("");
  };

  const seleccionarImagen = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];

    if (!archivo) return;

    setErrorFormulario("");

    if (!archivo.type.startsWith("image/")) {
      setErrorFormulario("Seleccioná un archivo de imagen válido.");
      evento.target.value = "";
      return;
    }

    if (archivo.size > 1024 * 1024) {
      setErrorFormulario("La imagen debe pesar como máximo 1 MB.");
      evento.target.value = "";
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {
      if (typeof lector.result === "string") {
        setImagenArchivo(lector.result);
        setPoster("");
        setErrorFormulario("");
      }
    };

    lector.onerror = () => {
      setErrorFormulario("No se pudo leer la imagen seleccionada.");
    };

    lector.readAsDataURL(archivo);
  };

  const quitarImagen = () => {
    setImagenArchivo("");
    setPoster("");
    setErrorFormulario("");

    const inputImagen = document.getElementById(
      "archivo-poster",
    ) as HTMLInputElement | null;

    if (inputImagen) inputImagen.value = "";
  };

  const limpiarFormulario = () => {
    setPeliculaEditando(null);
    setTitulo("");
    setDescripcion("");
    setAnio("");
    setGeneros([]);
    setNuevoGenero("");
    setCalificacion(0);
    setPoster("");
    setImagenArchivo("");
    setErrorFormulario("");
    setIntentoGuardar(false);

    const inputImagen = document.getElementById(
      "archivo-poster",
    ) as HTMLInputElement | null;

    if (inputImagen) inputImagen.value = "";
  };

  const abrirEdicion = (pelicula: Contenido) => {
    setPeliculaEditando(pelicula);
    setTitulo(pelicula.name || pelicula.title || "");
    setDescripcion(pelicula.description || pelicula.overview || "");
    setAnio(String(pelicula.year ?? ""));
    setGeneros(obtenerGenerosDePelicula(pelicula));
    setNuevoGenero("");
    setCalificacion(obtenerNota(pelicula));

    const imagenActual = pelicula.poster || "";

    if (imagenActual.startsWith("data:image/")) {
      setImagenArchivo(imagenActual);
      setPoster("");
    } else {
      setImagenArchivo("");
      setPoster(imagenActual);
    }

    setErrorFormulario("");
    setIntentoGuardar(false);
    setMostrarModal(true);
  };

  const guardarPelicula = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setIntentoGuardar(true);
    setErrorFormulario("");

    const nombreLimpio = titulo.trim();
    const sinopsisLimpia = descripcion.trim();

    if (
      !tituloValido ||
      !descripcionValida ||
      !anioValido ||
      !calificacionValida ||
      !generosValidos
    ) {
      return;
    }

    const duplicada = peliculas.some((pelicula) => {
      if (peliculaEditando && pelicula.id === peliculaEditando.id) {
        return false;
      }

      const tituloExistente = normalizarTitulo(
        pelicula.name || pelicula.title || "",
      );

      return (
        tituloExistente === normalizarTitulo(nombreLimpio) &&
        Number(pelicula.year) === Number(anio)
      );
    });

    if (duplicada) {
      setErrorFormulario(
        `Ya existe "${nombreLimpio}" (${anio}) en el catálogo. No podés agregarla otra vez.`,
      );
      return;
    }

    const datosPelicula: Contenido = {
      ...(peliculaEditando ?? {}),
      id: peliculaEditando?.id ?? `local-movie-${Date.now()}`,
      name: nombreLimpio,
      title: nombreLimpio,
      description: sinopsisLimpia,
      overview: sinopsisLimpia,
      year: Number(anio),
      genres: [...generos],
      imdbRating: `${calificacion}/5`,
      rating: calificacion,
      poster: imagenArchivo || poster.trim(),
      type: "movie",
    };

    try {
      const cambios = obtenerCambios();

      if (peliculaEditando) {
        const esLocal = cambios.agregadas.movie.some(
          (pelicula) => pelicula.id === peliculaEditando.id,
        );

        const nuevosCambios = esLocal
          ? {
              ...cambios,
              agregadas: {
                ...cambios.agregadas,
                movie: cambios.agregadas.movie.map((pelicula) =>
                  pelicula.id === datosPelicula.id ? datosPelicula : pelicula,
                ),
              },
            }
          : {
              ...cambios,
              editadas: {
                ...cambios.editadas,
                movie: [
                  ...cambios.editadas.movie.filter(
                    (pelicula) => pelicula.id !== datosPelicula.id,
                  ),
                  datosPelicula,
                ],
              },
            };

        guardarCambios(nuevosCambios);

        setPeliculas((actuales) =>
          actuales.map((pelicula) =>
            pelicula.id === datosPelicula.id ? datosPelicula : pelicula,
          ),
        );
      } else {
        guardarCambios({
          ...cambios,
          agregadas: {
            ...cambios.agregadas,
            movie: [datosPelicula, ...cambios.agregadas.movie],
          },
        });

        const cambiosGuardados = obtenerCambios();

        const guardada = cambiosGuardados.agregadas.movie.some(
          (pelicula) => pelicula.id === datosPelicula.id,
        );

        if (!guardada) {
          setErrorFormulario(
            "No se pudo confirmar el guardado de la película.",
          );
          return;
        }

        setPeliculas((actuales) => [datosPelicula, ...actuales]);
      }

      setBusqueda("");
      limpiarFormulario();
      setMostrarModal(false);
      setError("");
    } catch (error) {
      console.error("Error al guardar la película:", error);
      setErrorFormulario(
        "No se pudieron guardar los cambios. Probá con una imagen más pequeña.",
      );
    }
  };

  const borrarPelicula = (id: string) => {
    try {
      const cambios = obtenerCambios();
      const esLocal = cambios.agregadas.movie.some((p) => p.id === id);

      const nuevosCambios = {
        ...cambios,
        agregadas: {
          ...cambios.agregadas,
          movie: cambios.agregadas.movie.filter((p) => p.id !== id),
        },
        editadas: {
          ...cambios.editadas,
          movie: cambios.editadas.movie.filter((p) => p.id !== id),
        },
        eliminadas: {
          ...cambios.eliminadas,
          movie: esLocal
            ? cambios.eliminadas.movie
            : [...new Set([...cambios.eliminadas.movie, id])],
        },
      };

      guardarCambios(nuevosCambios);

      setPeliculas((actuales) => actuales.filter((p) => p.id !== id));
      setIdConfirmarBorrado(null);
      setError("");
    } catch (error) {
      console.error("Error al borrar la película:", error);
      setError("No se pudo guardar la eliminación.");
    }
  };

  const peliculasFiltradas = peliculas.filter((pelicula) =>
    (pelicula.name || pelicula.title || "")
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  const avisoPendiente = (valido: boolean, mensaje: string) =>
    intentoGuardar && !valido ? (
      <p className="mt-1 text-sm text-amber-400" role="alert">
        {mensaje}
      </p>
    ) : null;

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Administrar películas</h1>
            <p className="mt-2 text-gray-400">
              Agregá, consultá, editá y borrá películas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              limpiarFormulario();
              setMostrarModal(true);
            }}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
          >
            + Agregar película
          </button>
        </div>

        <input
          type="search"
          placeholder="Buscar película..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-6 w-full rounded-lg border border-gray-700 bg-[#111827] px-4 py-3 text-white outline-none focus:border-blue-500"
        />

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-950 p-3 text-red-300"
          >
            {error}
          </p>
        )}

        {cargando && <p>Cargando películas...</p>}

        {!cargando && peliculasFiltradas.length === 0 && (
          <p className="text-gray-400">No se encontraron películas.</p>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {peliculasFiltradas.map((pelicula) => (
            <CardAdmin
              key={pelicula.id}
              contenido={pelicula}
              tipo="movie"
              nota={obtenerNota(pelicula)}
              generos={obtenerGenerosDePelicula(pelicula)}
              confirmarBorrado={idConfirmarBorrado === pelicula.id}
              onEditar={abrirEdicion}
              onSolicitarBorrado={setIdConfirmarBorrado}
              onConfirmarBorrado={() => borrarPelicula(pelicula.id)}
              onCancelarBorrado={() => setIdConfirmarBorrado(null)}
            />
          ))}
        </div>

        <div className="mt-8">
          <Link to="/admin" className="text-blue-400 hover:underline">
            ← Volver al administrador
          </Link>
        </div>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-700 bg-[#111827] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">
                {peliculaEditando ? "Editar película" : "Agregar película"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  limpiarFormulario();
                  setMostrarModal(false);
                }}
                className="text-2xl text-gray-400 hover:text-white"
                aria-label="Cerrar ventana"
              >
                &times;
              </button>
            </div>

            <form onSubmit={guardarPelicula} noValidate className="space-y-4">
              {errorFormulario && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-950 p-3 text-sm text-red-300"
                >
                  {errorFormulario}
                </p>
              )}

              <div>
                <label htmlFor="titulo-pelicula" className="mb-2 block">
                  Título <span className="text-red-400">*</span>
                </label>

                <input
                  id="titulo-pelicula"
                  type="text"
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    setErrorFormulario("");
                  }}
                  className="w-full rounded-lg border border-gray-700 bg-[#070b14] px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Nombre de la película"
                />

                {avisoPendiente(tituloValido, "Falta agregar el título.")}
              </div>

              <div>
                <label htmlFor="descripcion-pelicula" className="mb-2 block">
                  Sinopsis <span className="text-red-400">*</span>
                </label>

                <textarea
                  id="descripcion-pelicula"
                  value={descripcion}
                  onChange={(e) => {
                    setDescripcion(e.target.value);
                    setErrorFormulario("");
                  }}
                  rows={4}
                  className="w-full resize-y rounded-lg border border-gray-700 bg-[#070b14] px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="¿De qué trata la película?"
                />

                {avisoPendiente(
                  descripcionValida,
                  "Falta agregar la sinopsis.",
                )}
              </div>

              <div>
                <label htmlFor="anio-pelicula" className="mb-2 block">
                  Año <span className="text-red-400">*</span>
                </label>

                <input
                  id="anio-pelicula"
                  type="number"
                  value={anio}
                  onChange={(e) => {
                    setAnio(e.target.value);
                    setErrorFormulario("");
                  }}
                  min="1888"
                  max="2100"
                  className="w-full rounded-lg border border-gray-700 bg-[#070b14] px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Ej. 2003"
                />

                {avisoPendiente(
                  anioValido,
                  "Falta agregar un año válido entre 1888 y 2100.",
                )}
              </div>

              <div>
                <p className="mb-2 font-medium">
                  Calificación <span className="text-red-400">*</span>
                </p>

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
                      className={`text-3xl transition hover:scale-110 ${
                        estrella <= calificacion
                          ? "text-yellow-400"
                          : "text-gray-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}

                  {calificacionValida && (
                    <>
                      <span className="ml-2 text-sm text-gray-400">
                        {calificacion} de 5
                      </span>

                      <button
                        type="button"
                        onClick={() => setCalificacion(0)}
                        className="ml-2 text-xs text-blue-300 hover:underline"
                      >
                        Quitar
                      </button>
                    </>
                  )}
                </div>

                {avisoPendiente(
                  calificacionValida,
                  "Falta completar la calificación: seleccioná al menos una estrella.",
                )}
              </div>

              <div>
                <p className="mb-2 font-medium">
                  Géneros <span className="text-red-400">*</span>
                </p>

                {generosDisponibles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {generosDisponibles.map((genero) => {
                      const seleccionado = generos.some(
                        (g) =>
                          g.toLocaleLowerCase() === genero.toLocaleLowerCase(),
                      );

                      return (
                        <button
                          key={genero}
                          type="button"
                          onClick={() => alternarGenero(genero)}
                          aria-pressed={seleccionado}
                          className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                            seleccionado
                              ? "border-blue-400 bg-blue-600 text-white"
                              : "border-gray-600 bg-[#070b14] text-gray-300 hover:border-blue-500"
                          }`}
                        >
                          {seleccionado ? "✓ " : ""}
                          {genero}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <input
                    value={nuevoGenero}
                    onChange={(e) => setNuevoGenero(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        agregarGeneroPersonalizado();
                      }
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-[#070b14] px-3 py-2 outline-none focus:border-blue-500"
                    placeholder="Agregar otro género"
                    aria-label="Nombre del nuevo género"
                  />

                  <button
                    type="button"
                    onClick={agregarGeneroPersonalizado}
                    className="rounded-lg bg-gray-700 px-3 py-2 font-semibold hover:bg-gray-600"
                  >
                    Agregar
                  </button>
                </div>

                <p className="mt-3 text-sm text-gray-400">
                  Seleccionados:{" "}
                  {generosValidos ? generos.join(" · ") : "Ninguno"}
                </p>

                {avisoPendiente(
                  generosValidos,
                  "Falta agregar o seleccionar al menos un género.",
                )}
              </div>

              <div>
                <label className="mb-2 block" htmlFor="archivo-poster">
                  Imagen del póster (opcional)
                </label>

                <label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-600 px-4 py-4 text-gray-300 hover:border-blue-500 hover:text-white">
                  <span>📁 Seleccionar imagen de la computadora</span>

                  <input
                    id="archivo-poster"
                    type="file"
                    accept="image/*"
                    onChange={seleccionarImagen}
                    className="hidden"
                  />
                </label>

                <p className="mb-2 text-sm text-gray-400">
                  Máximo 1 MB. Formatos de imagen habituales.
                </p>

                <label htmlFor="url-poster" className="mb-2 block">
                  O pegá un enlace a la imagen
                </label>

                <input
                  id="url-poster"
                  type="url"
                  value={poster}
                  onChange={(e) => {
                    setPoster(e.target.value);
                    setImagenArchivo("");
                    setErrorFormulario("");

                    const inputImagen = document.getElementById(
                      "archivo-poster",
                    ) as HTMLInputElement | null;

                    if (inputImagen) inputImagen.value = "";
                  }}
                  className="w-full rounded-lg border border-gray-700 bg-[#070b14] px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="https://..."
                />

                {(imagenArchivo || poster) && (
                  <div className="mt-3">
                    <p className="mb-2 text-sm text-gray-400">Vista previa</p>

                    <img
                      src={imagenArchivo || poster}
                      alt="Vista previa del póster"
                      className="mx-auto max-h-56 rounded-lg object-contain"
                      onError={() => {
                        setErrorFormulario(
                          "No se pudo cargar la imagen. Revisá el archivo o la URL.",
                        );
                      }}
                    />

                    <button
                      type="button"
                      onClick={quitarImagen}
                      className="mt-3 w-full rounded-lg bg-red-600 px-4 py-2 font-semibold hover:bg-red-700"
                    >
                      Quitar imagen
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    limpiarFormulario();
                    setMostrarModal(false);
                  }}
                  className="flex-1 rounded-lg bg-gray-700 px-4 py-3 font-semibold hover:bg-gray-600"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-700"
                >
                  {peliculaEditando ? "Guardar cambios" : "Guardar película"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
