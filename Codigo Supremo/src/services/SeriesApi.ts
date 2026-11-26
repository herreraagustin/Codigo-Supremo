export const API_BASE = "https://api.streamx.qzz.io";

export interface SerieResumen {
  id: string;
  name: string;
  poster: string;
  year: string;
  rating: string;
  description: string;
  genres: string[];
}

export interface Episodio {
  id: string;
  season: number;
  number: number;
  name: string;
  overview: string;
  released: string;
  image: string;
}

export interface SerieDetalle extends SerieResumen {
  background: string;
  runtime: string;
  cast: string[];
  temporadas: number[];
  episodios: Episodio[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Crudo = Record<string, any>;

export const posterDe = (id: string) =>
  `${API_BASE}/img/poster/medium/${id}/img`;

function normalizarResumen(m: Crudo): SerieResumen {
  const generos = Array.isArray(m.genres)
    ? m.genres
    : Array.isArray(m.genre)
      ? m.genre
      : [];

  const rating = m.imdbRating ?? m.rating ?? "";

  return {
    id: String(m.id ?? m.imdb_id ?? ""),
    name: String(m.name ?? m.title ?? "Sin título"),
    poster: String(m.poster || posterDe(String(m.id ?? ""))),
    year: String(m.releaseInfo ?? m.year ?? ""),
    rating: rating === "" || rating == null ? "" : String(rating),
    description: String(m.description ?? ""),
    genres: generos.map(String),
  };
}

export async function getSeries(opciones: {
  genre?: string;
  skip?: number;
  signal?: AbortSignal;
}): Promise<SerieResumen[]> {
  const url = new URL(`${API_BASE}/catalog/series/top`);

  if (opciones.genre) url.searchParams.set("genre", opciones.genre);
  if (opciones.skip) url.searchParams.set("skip", String(opciones.skip));

  const res = await fetch(url.toString(), { signal: opciones.signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: Crudo = await res.json();
  const metas: Crudo[] = Array.isArray(data.metas) ? data.metas : [];

  return metas.map(normalizarResumen).filter((s) => s.id !== "");
}

export async function getSerie(
  id: string,
  signal?: AbortSignal,
): Promise<SerieDetalle> {
  const res = await fetch(
    `${API_BASE}/meta/series/${encodeURIComponent(id)}?enrich=0`,
    { signal },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: Crudo = await res.json();
  const m: Crudo = data.meta ?? data;

  if (!m || (!m.id && !m.name)) throw new Error("Serie no encontrada");

  const base = normalizarResumen({ ...m, id: m.id ?? id });
  const videos: Crudo[] = Array.isArray(m.videos) ? m.videos : [];

  const episodios: Episodio[] = videos
    .map((v) => ({
      id: String(v.id ?? `${v.season}-${v.number ?? v.episode}`),
      season: Number(v.season ?? 0),
      number: Number(v.number ?? v.episode ?? 0),
      name: String(v.name ?? v.title ?? ""),
      overview: String(v.overview ?? v.description ?? ""),
      released: String(v.released ?? ""),
      image: String(v.still ?? v.thumbnail ?? ""),
    }))
    .sort((a, b) => a.season - b.season || a.number - b.number);

  const temporadas = Array.from(new Set(episodios.map((e) => e.season))).sort(
    (a, b) => a - b,
  );

  return {
    ...base,
    poster: String(
      m.poster ||
        m.images?.poster?.large ||
        m.images?.poster?.medium ||
        posterDe(base.id),
    ),
    description: base.description || String(m.wiki?.extract ?? ""),
    background: String(m.background ?? m.images?.background?.large ?? ""),
    runtime: String(m.runtime ?? ""),
    cast: Array.isArray(m.cast) ? m.cast.map(String) : [],
    temporadas,
    episodios,
  };
}
