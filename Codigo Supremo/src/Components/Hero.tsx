import type { Movie } from "../types/Movies";

type HeroProps = {
  movies: Movie[];
};

function splitTitle(name: string) {
  if (name.includes(":")) {
    const [first, ...rest] = name.split(":");
    return { top: first + ":", bottom: rest.join(":").trim() };
  }
  const words = name.split(" ");
  if (words.length < 2) return { top: name, bottom: "" };
  const cut = Math.ceil(words.length / 2);
  return {
    top: words.slice(0, cut).join(" "),
    bottom: words.slice(cut).join(" "),
  };
}

const Dot = () => (
  <span className="h-1 w-1 rounded-full bg-slate-500" aria-hidden="true" />
);

export default function Hero({ movies }: HeroProps) {
 
  const featured = movies.find((m) => m.isFeatured);
  const fallback = movies.find((m) => m.published) ?? movies[0];
  const movie = featured ?? fallback;
  const isDefault = !featured;

  if (!movie) {
    return (
      <section className="flex min-h-[320px] items-center justify-center text-slate-400">
        Cargando películas...
      </section>
    );
  }

  const { top, bottom } = splitTitle(movie.name);

  return (
    <section className="relative isolate overflow-hidden">
      
      {movie.image && (
        <img
          src={movie.image}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover object-top"
        />
      )}
    
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#070b14] via-[#070b14]/80 to-[#070b14]/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#070b14] via-transparent to-[#070b14]/40" />

      <div className="mx-auto flex min-h-[480px] max-w-7xl flex-col justify-center gap-5 px-4 py-16 sm:px-6 md:min-h-[540px]">
        
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wide">
          <span className="flex items-center gap-1 rounded-full bg-cyan-400/15 px-3 py-1 text-cyan-300 ring-1 ring-cyan-400/30">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
            </svg>
            Película destacada
          </span>
          <span className="text-slate-200">{movie.category}</span>
          <span className="rounded bg-white/10 px-2 py-1 text-slate-300">
            4K Ultra HD
          </span>
        </div>

       
        <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl md:text-6xl">
          {top}
          {bottom && (
            <>
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                {bottom}
              </span>
            </>
          )}
        </h1>

        <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-300">
          {movie.year && (
            <>
              <span>{movie.year}</span>
              <Dot />
            </>
          )}
          {movie.duration && (
            <>
              <span>{movie.duration}</span>
              <Dot />
            </>
          )}
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold">
            HDR10+
          </span>
          <Dot />
          <span className="font-normal">Audio Espacial 7.1</span>
          {movie.rating && (
            <>
              <Dot />
              <span className="flex items-center gap-1 text-cyan-300">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
                </svg>
                {movie.rating} / 10
              </span>
            </>
          )}
        </div>

        <p className="line-clamp-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
          {movie.description || "Sin descripción disponible."}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400"
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6 4v16l14-8z" />
            </svg>
            Ver ahora
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/20"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 8h.01" />
            </svg>
            Más información
          </button>
          <button
            type="button"
            aria-label="Guardar en mi lista"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/10 transition hover:bg-white/20"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 3h12v18l-6-4-6 4z" />
            </svg>
          </button>
        </div>

        {isDefault && (
          <p className="flex items-center gap-2 text-[11px] text-slate-400">
            <svg className="h-3.5 w-3.5 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
              <circle cx="16" cy="7" r="2" />
              <circle cx="8" cy="17" r="2" />
            </svg>
            Mostrando película predeterminada del catálogo si no hay selección
            manual en cabecera de reproducción.
          </p>
        )}
      </div>
    </section>
  );
}