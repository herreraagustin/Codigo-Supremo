
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

export function obtenerCambios(): CambiosCatalogo {
  try {
    const datos = localStorage.getItem(CLAVE_ALMACENAMIENTO);

    if (!datos) {
      return cambiosIniciales;
    }

    const cambios = JSON.parse(datos) as Partial<CambiosCatalogo>;

    return {
      agregadas: {
        movie: cambios.agregadas?.movie ?? [],
        series: cambios.agregadas?.series ?? [],
      },
      eliminadas: {
        movie: cambios.eliminadas?.movie ?? [],
        series: cambios.eliminadas?.series ?? [],
      },
      editadas: {
        movie: cambios.editadas?.movie ?? [],
        series: cambios.editadas?.series ?? [],
      },
    };
  } catch (error) {
    console.error("Error al leer los cambios guardados:", error);
    return cambiosIniciales;
  }
}

export function guardarCambios(cambios: CambiosCatalogo): void {
  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(cambios));

    window.dispatchEvent(new Event("catalogo-actualizado"));
  } catch (error) {
    console.error("Error al guardar los cambios:", error);
    throw new Error("No se pudieron guardar los cambios.");
  }
}
