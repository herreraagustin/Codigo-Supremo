
const API_URL = "https://api.streamx.qzz.io";


export interface Contenido {
  id: string;
  title?: string;
  name?: string;
  type?: string;
  year?: number | string;
  poster?: string;
  overview?: string;
  description?: string;
  imdbRating?: string;
  genres?: string[];
  [key: string]: unknown;
}


export async function obtenerCatalogo(
  tipo: "movie" | "series",
  catalogo = "top"
): Promise<Contenido[]> {
  const respuesta = await fetch(
    `${API_URL}/catalog/${tipo}/${catalogo}`
  );

  if (!respuesta.ok) {
    throw new Error(`Error HTTP: ${respuesta.status}`);
  }

  const datos = await respuesta.json();

  console.log(`Catálogo de ${tipo}:`, datos);

  console.log(
  "Primera película o serie:",
  JSON.stringify(datos.metas?.[0], null, 2)
);

  if (Array.isArray(datos)) {
    return datos;
  }

 if (Array.isArray(datos.metas)) {
  return datos.metas;
}

return [];
}
