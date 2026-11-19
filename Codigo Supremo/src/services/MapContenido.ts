import type { Movie } from "../Types/Movies";
import type { Contenido } from "./peliculas";

export function mapContenido(c: Contenido): Movie {
  const background = typeof c.background === "string" ? c.background : "";

  return {
    id: String(c.id),
    name: c.title ?? c.name ?? "Sin título",
    description: c.overview ?? c.description ?? "",
    category: c.genres?.[0] ?? "Sin categoría",
    image: background || c.poster || "",
    published: true,
    isFeatured: false, 
    year: c.year,
    rating: c.imdbRating,
  };
}