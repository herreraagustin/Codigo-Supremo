type GenreFilterProps = {
  titulo?: string;
  generos: string[];
  activo: string | null;
  onSelect: (genero: string) => void;
  onClear: () => void;
};

const ICONOS: Record<string, string> = {
  accion: "🎬",
  comedia: "😄",
  drama: "🎭",
  terror: "👻",
  suspenso: "😱",
  romance: "💗",
  "ciencia ficcion": "🚀",
  fantasia: "🐉",
  aventura: "🧭",
  deportes: "⚽",
  animacion: "🐾",
  documental: "🎥",
  musical: "🎵",
  familiar: "😊",
  crimen: "🔫",
  guerra: "🪖",
  misterio: "🔍",
  historia: "📜",
  biografia: "👤",
};

function iconoDe(genero: string): string {
  const clave = genero
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  return ICONOS[clave] ?? "🎞️";
}

export default function GenreFilter({
  titulo = "Géneros",
  generos,
  activo,
  onSelect,
  onClear,
}: GenreFilterProps) {
  if (generos.length === 0) return null;

  return (
    <section
      aria-label="Filtro de géneros"
      className="mb-10 rounded-2xl bg-[#0b1220] p-5 ring-1 ring-white/10"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="text-cyan-300" aria-hidden="true">
            ⏷
          </span>
          {titulo}
        </h2>

        <button
          type="button"
          onClick={onClear}
          disabled={!activo}
          className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-white/15 transition hover:text-white hover:ring-white/40 disabled:cursor-default disabled:opacity-40 disabled:hover:text-slate-300 disabled:hover:ring-white/15"
        >
          <span aria-hidden="true">↻</span>
          Limpiar filtros
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {generos.map((genero) => {
          const seleccionado =
            activo?.toLowerCase() === genero.toLowerCase();

          return (
            <button
              key={genero}
              type="button"
              onClick={() => onSelect(genero)}
              aria-pressed={seleccionado}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
                seleccionado
                  ? "bg-blue-500 text-white"
                  : "bg-[#151d2e] text-slate-300 ring-1 ring-white/10 hover:ring-blue-500/60"
              }`}
            >
              <span aria-hidden="true">{iconoDe(genero)}</span>
              {genero}
            </button>
          );
        })}
      </div>
    </section>
  );
}