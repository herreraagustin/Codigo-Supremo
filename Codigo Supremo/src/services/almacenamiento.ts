
import type { Contenido } from "./peliculas";

const CLAVE_ALMACENAMIENTO = "cinerolling_cambios";

export interface CambiosCatalogo {
  agregadas: {
    movie: Contenido[];
    series: Contenido[];
  };
  eliminadas: {
    movie: string[];
    series: string[];
  };
  editadas: {
    movie: Contenido[];
    series: Contenido[];
  };
}

const cambiosIniciales: CambiosCatalogo = {
  agregadas: {
    movie: [],
    series: [],
  },
  eliminadas: {
    movie: [],
    series: [],
  },
  editadas: {
    movie: [],
    series: [],
  },
};

function esContenidoArray(valor: unknown): valor is Contenido[] {
  return (
    Array.isArray(valor) &&
    valor.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string"
    )
  );
}

function esIdArray(valor: unknown): valor is string[] {
  return (
    Array.isArray(valor) &&
    valor.every((id) => typeof id === "string")
  );
}

export function obtenerCambios(): CambiosCatalogo {
  try {
    const datos = localStorage.getItem(CLAVE_ALMACENAMIENTO);

    if (!datos) {
      return cambiosIniciales;
    }

    const cambios: unknown = JSON.parse(datos);

    if (!cambios || typeof cambios !== "object") {
      return cambiosIniciales;
    }

    const guardados = cambios as Partial<CambiosCatalogo>;

    return {
      agregadas: {
        movie: esContenidoArray(guardados.agregadas?.movie)
          ? guardados.agregadas.movie
          : [],
        series: esContenidoArray(guardados.agregadas?.series)
          ? guardados.agregadas.series
          : [],
      },
      eliminadas: {
        movie: esIdArray(guardados.eliminadas?.movie)
          ? guardados.eliminadas.movie
          : [],
        series: esIdArray(guardados.eliminadas?.series)
          ? guardados.eliminadas.series
          : [],
      },
      editadas: {
        movie: esContenidoArray(guardados.editadas?.movie)
          ? guardados.editadas.movie
          : [],
        series: esContenidoArray(guardados.editadas?.series)
          ? guardados.editadas.series
          : [],
      },
    };
  } catch (error) {
    console.error("Error al leer los cambios guardados:", error);
    return cambiosIniciales;
  }
}

export function guardarCambios(cambios: CambiosCatalogo): void {
  try {
    localStorage.setItem(
      CLAVE_ALMACENAMIENTO,
      JSON.stringify(cambios)
    );

    window.dispatchEvent(new Event("catalogo-actualizado"));
  } catch (error) {
    console.error("Error al guardar los cambios:", error);
    throw new Error("No se pudieron guardar los cambios.");
  }
}

/**
 * Reconstruye el catálogo de la API aplicando los cambios locales.
 * Mantiene las adiciones, respeta las eliminaciones y aplica las ediciones.
 */
export function aplicarCambiosCatalogo(
  originales: Contenido[],
  tipo: "movie" | "series"
): Contenido[] {
  const cambios = obtenerCambios();

  const eliminadas = new Set(cambios.eliminadas[tipo]);
  const agregadas = cambios.agregadas[tipo];
  const editadas = cambios.editadas[tipo];

  const edicionesPorId = new Map(
    editadas.map((contenido) => [contenido.id, contenido])
  );

  const originalesActualizados = originales
    .filter((contenido) => !eliminadas.has(contenido.id))
    .map((contenido) => ({
      ...contenido,
      ...(edicionesPorId.get(contenido.id) ?? {}),
    }));

  const idsOriginales = new Set(
    originalesActualizados.map((contenido) => contenido.id)
  );

  const agregadasVisibles = agregadas.filter(
    (contenido) =>
      !eliminadas.has(contenido.id) &&
      !idsOriginales.has(contenido.id)
  );

  return [...agregadasVisibles, ...originalesActualizados];
}
