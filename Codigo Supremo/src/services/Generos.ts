// src/services/generos.ts
import type { Contenido } from "./peliculas";

export function obtenerGenerosDeContenido(item: Contenido): string[] {
  const resultado: string[] = [];

  const agregar = (valor: unknown) => {
    let lista: string[] = [];

    if (Array.isArray(valor)) {
      lista = valor.filter((x): x is string => typeof x === "string");
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

  agregar(item.genres);
  agregar(item["genre"]);

  return resultado;
}