
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { obtenerCatalogo } from "../services/peliculas";
import type { Contenido } from "../services/peliculas";
import { obtenerCambios, guardarCambios } from "../services/almacenamiento";

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
        !resultado.some((g) => g.toLocaleLowerCase() === limpio.toLocaleLowerCase())
      ) {
        resultado.push(limpio);
      }
    });
  };

  agregar(pelicula.genres);
  agregar(pelicula["genre"]);
  return resultado;
}

export const AdminPeliculas = () => {
  const [peliculas, setPeliculas] = useState<Contenido[]>([]);
  const [generosDisponibles, setGenerosDisponibles] = useState<string[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [idConfirmarBorrado, setIdConfirmarBorrado] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [anio, setAnio] = useState("");
  const [calificacion, setCalificacion] = useState(0);
  const [poster, setPoster] = useState("");
  const [imagenArchivo, setImagenArchivo] = useState("");

  useEffect(() => {
    async function cargarPeliculas() {
      try {
        const cambios = obtenerCambios();
        const datos = await obtenerCatalogo("movie");

        const listaGeneros = datos.flatMap(obtenerGenerosDePelicula);
        const unicos = Array.from(
          new Map(listaGeneros.map((g) => [g.toLocaleLowerCase(), g])).values()
        ).sort((a, b) => a.localeCompare(b));

        setGenerosDisponibles(unicos);

        const originales = datos.filter(
          (pelicula) => !cambios.eliminadas.movie.includes(pelicula.id)
        );

        setPeliculas([
          ...cambios.agregadas.movie,
          ...originales.filter(
            (original) =>
              !cambios.agregadas.movie.some((local) => local.id === original.id)
          ),
        ]);
      } catch (error) {
        console.error(error);
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
        ? actuales.filter((g) => g.toLocaleLowerCase() !== genero.toLocaleLowerCase())
        : [...actuales, genero]
    );
  };

  const seleccionarImagen = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      setError("Seleccioná un archivo de imagen válido.");
      evento.target.value = "";
      return;
    }

    if (archivo.size > 1024 * 1024) {
      setError("La imagen debe pesar como máximo 1 MB.");
      evento.target.value = "";
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {
      if (typeof lector.result === "string") {
        setImagenArchivo(lector.result);
        setPoster("");
        setError("");
      }
    };

    lector.onerror = () => setError("No se pudo leer la imagen seleccionada.");
    lector.readAsDataURL(archivo);
  };

  const quitarImagen = () => {
    setImagenArchivo("");
    setPoster("");

    const inputImagen = document.getElementById("archivo-poster") as HTMLInputElement | null;
    if (inputImagen) inputImagen.value = "";
  };

  const limpiarFormulario = () => {
    setTitulo("");
    setDescripcion("");
    setAnio("");
    setGeneros([]);
    setCalificacion(0);
    quitarImagen();
    setError("");
  };

  const agregarPelicula = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setError("");

    const nombreLimpio = titulo.trim();
    const sinopsisLimpia = descripcion.trim();

    if (!nombreLimpio || !sinopsisLimpia) {
      setError("Completá el título y la sinopsis.");
      return;
    }

    const nuevaPelicula: Contenido = {
      id: `local-movie-${Date.now()}`,
      name: nombreLimpio,
      title: nombreLimpio,
      description: sinopsisLimpia,
      overview: sinopsisLimpia,
      year: anio ? Number(anio) : undefined,
      genres: [...generos],
      imdbRating: calificacion > 0 ? `${calificacion}/5` : "",
      rating: calificacion || undefined,
      poster: imagenArchivo || poster.trim(),
      type: "movie",
    };

    try {
      const cambios = obtenerCambios();

      guardarCambios({
        ...cambios,
        agregadas: {
          ...cambios.agregadas,
          movie: [nuevaPelicula, ...cambios.agregadas.movie],
        },
      });

      setPeliculas((actuales) => [nuevaPelicula, ...actuales]);
      setBusqueda("");
      limpiarFormulario();
      setMostrarModal(false);
    } catch (error) {
      console.error("Error al guardar la película:", error);
      setError("No se pudo guardar la película. Probá con una imagen más pequeña.");
    }
  };

  const borrarPelicula = (id: string) => {
    const cambios = obtenerCambios();
    const esLocal = cambios.agregadas.movie.some((p) => p.id === id);

    const nuevosCambios = {
      agregadas: {
        ...cambios.agregadas,
        movie: cambios.agregadas.movie.filter((p) => p.id !== id),
      },
      eliminadas: {
        ...cambios.eliminadas,
        movie: esLocal
          ? cambios.eliminadas.movie
          : [...new Set([...cambios.eliminadas.movie, id])],
      },
    };

    try {
      guardarCambios(nuevosCambios);
      setPeliculas((actuales) => actuales.filter((p) => p.id !== id));
      setIdConfirmarBorrado(null);
      setError("");
    } catch {
      setError("No se pudo guardar la eliminación.");
    }
  };

  const peliculasFiltradas = peliculas.filter((pelicula) =>
    (pelicula.name || pelicula.title || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const estrellas = (valor: number) => (
    <div className="flex items-center gap-1" aria-label={`Calificación: ${valor} de 5`}>
      {[1, 2, 3, 4, 5].map((estrella) => (
        <span key={estrella} className={estrella <= valor ? "text-yellow-400" : "text-gray-600"}>
          ★
        </span>
      ))}
      {valor > 0 && <span className="ml-2 text-sm text-gray-400">{valor}/5</span>}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Administrar películas</h1>
            <p className="mt-2 text-gray-400">Agregá, consultá y borrá películas.</p>
          </div>

          <button type="button" onClick={() => { limpiarFormulario(); setMostrarModal(true); }}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700">
            + Agregar película
          </button>
        </div>

        <input type="search" placeholder="Buscar película..." value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-6 w-full rounded-lg border border-gray-700 bg-[#111827] px-4 py-3 text-white outline-none focus:border-blue-500" />

        {error && <p role="alert" className="mb-4 rounded-lg bg-red-950 p-3 text-red-300">{error}</p>}
        {cargando && <p>Cargando películas...</p>}
        {!cargando && peliculasFiltradas.length === 0 && <p className="text-gray-400">No se encontraron películas.</p>}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {peliculasFiltradas.map((pelicula) => {
            const generosPelicula = obtenerGenerosDePelicula(pelicula);
            const nombre = pelicula.name || pelicula.title || "Sin título";
            const nota = Number(pelicula.rating) || 0;

            return (
              <article key={pelicula.id} className="overflow-hidden rounded-xl border border-gray-800 bg-[#111827]">
                {pelicula.poster ? (
                  <img src={pelicula.poster} alt={nombre} className="h-72 w-full object-cover" />
                ) : (
                  <div className="flex h-72 items-center justify-center bg-gray-800 text-gray-400">Sin póster</div>
                )}

                <div className="p-4">
                  <h2 className="mb-2 text-lg font-bold">{nombre}</h2>
                  <p className="mb-3 text-sm text-gray-400">Año: {pelicula.year || "No disponible"}</p>
                  {nota > 0 && <div className="mb-3">{estrellas(nota)}</div>}

                  {generosPelicula.length > 0 && (
                    <p className="mb-4 text-sm text-blue-300">{generosPelicula.join(" · ")}</p>
                  )}

                  {idConfirmarBorrado === pelicula.id ? (
                    <div className="space-y-3 rounded-lg border border-red-800 bg-red-950/40 p-3">
                      <p className="text-sm text-red-200">¿Seguro que querés borrar esta película?</p>
                      <button type="button" onClick={() => borrarPelicula(pelicula.id)}
                        className="w-full rounded-lg bg-red-600 px-3 py-2 font-semibold hover:bg-red-700">
                        Sí, borrar película
                      </button>
                      <button type="button" onClick={() => setIdConfirmarBorrado(null)}
                        className="w-full rounded-lg bg-gray-700 px-3 py-2 font-semibold hover:bg-gray-600">
                        No, cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link to={`/pelicula/${pelicula.id}`}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-center font-semibold hover:bg-blue-700">
                        Ver detalles
                      </Link>
                      <button type="button" onClick={() => setIdConfirmarBorrado(pelicula.id)}
                        className="rounded-lg bg-red-600 px-4 py-2 font-semibold hover:bg-red-700">
                        Borrar película
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8">
          <Link to="/admin" className="text-blue-400 hover:underline">← Volver al administrador</Link>
        </div>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-700 bg-[#111827] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Agregar película</h2>
              <button type="button" onClick={() => { limpiarFormulario(); setMostrarModal(false); }}
                className="text-2xl text-gray-400 hover:text-white" aria-label="Cerrar ventana">
                &times;
              </button>
            </div>

            <form onSubmit={agregarPelicula} className="space-y-4">
              <div>
                <label htmlFor="titulo-pelicula" className="mb-2 block">Título</label>
                <input id="titulo-pelicula" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)}
                  required className="w-full rounded-lg border border-gray-700 bg-[#070b14] px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Nombre de la película" />
              </div>

              <div>
                <label htmlFor="descripcion-pelicula" className="mb-2 block">Sinopsis</label>
                <textarea id="descripcion-pelicula" value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                  required rows={4} className="w-full resize-y rounded-lg border border-gray-700 bg-[#070b14] px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="¿De qué trata la película?" />
              </div>

              <div>
                <label htmlFor="anio-pelicula" className="mb-2 block">Año</label>
                <input id="anio-pelicula" type="number" value={anio} onChange={(e) => setAnio(e.target.value)}
                  min="1888" max="2100" className="w-full rounded-lg border border-gray-700 bg-[#070b14] px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Ej. 2026" />
              </div>

              <div>
                <p className="mb-2 font-medium">Calificación</p>
                <div className="flex flex-wrap items-center gap-1">
                  {[1, 2, 3, 4, 5].map((estrella) => (
                    <button key={estrella} type="button" onClick={() => setCalificacion(estrella)}
                      aria-label={`${estrella} ${estrella === 1 ? "estrella" : "estrellas"}`}
                      aria-pressed={calificacion === estrella}
                      className={`text-3xl transition hover:scale-110 ${estrella <= calificacion ? "text-yellow-400" : "text-gray-600"}`}>
                      ★
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-400">{calificacion > 0 ? `${calificacion} de 5` : "Sin calificación"}</span>
                  {calificacion > 0 && <button type="button" onClick={() => setCalificacion(0)} className="ml-2 text-xs text-blue-300 hover:underline">Quitar</button>}
                </div>
              </div>

              <div>
                <p className="mb-2 font-medium">Géneros</p>
                {generosDisponibles.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {generosDisponibles.map((genero) => {
                        const seleccionado = generos.some((g) => g.toLocaleLowerCase() === genero.toLocaleLowerCase());
                        return (
                          <button key={genero} type="button" onClick={() => alternarGenero(genero)} aria-pressed={seleccionado}
                            className={`rounded-full border px-3 py-2 text-sm font-medium transition ${seleccionado ? "border-blue-400 bg-blue-600 text-white" : "border-gray-600 bg-[#070b14] text-gray-300 hover:border-blue-500"}`}>
                            {seleccionado ? "✓ " : ""}{genero}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-sm text-gray-400">Seleccionados: {generos.length ? generos.join(" · ") : "Ninguno"}</p>
                  </>
                ) : (
                  <p className="rounded-lg border border-yellow-800 bg-yellow-950/40 p-3 text-sm text-yellow-200">
                    La API no devolvió géneros para este catálogo. No agregamos opciones inventadas.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block">Imagen del póster</label>
                <label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-600 px-4 py-4 text-gray-300 hover:border-blue-500 hover:text-white">
                  <span>📁 Seleccionar imagen de la computadora</span>
                  <input id="archivo-poster" type="file" accept="image/*" onChange={seleccionarImagen} className="hidden" />
                </label>
                <p className="mb-2 text-sm text-gray-400">Máximo 1 MB. Formatos de imagen habituales.</p>

                <label htmlFor="url-poster" className="mb-2 block">O pegá un enlace a la imagen</label>
                <input id="url-poster" type="url" value={poster}
                  onChange={(e) => {
                    setPoster(e.target.value);
                    setImagenArchivo("");
                    const inputImagen = document.getElementById("archivo-poster") as HTMLInputElement | null;
                    if (inputImagen) inputImagen.value = "";
                  }}
                  className="w-full rounded-lg border border-gray-700 bg-[#070b14] px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="https://..." />

                {(imagenArchivo || poster) && (
                  <div className="mt-3">
                    <p className="mb-2 text-sm text-gray-400">Vista previa</p>
                    <img src={imagenArchivo || poster} alt="Vista previa del póster" className="mx-auto max-h-56 rounded-lg object-contain" />
                    <button type="button" onClick={quitarImagen}
                      className="mt-3 w-full rounded-lg bg-red-600 px-4 py-2 font-semibold hover:bg-red-700">
                      Quitar imagen
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <button type="button" onClick={() => { limpiarFormulario(); setMostrarModal(false); }}
                  className="flex-1 rounded-lg bg-gray-700 px-4 py-3 font-semibold hover:bg-gray-600">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-700">
                  Guardar película
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
