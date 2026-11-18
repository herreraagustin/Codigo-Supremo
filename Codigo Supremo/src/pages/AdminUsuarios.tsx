
import { Link } from "react-router-dom";

export const AdminUsuarios = () => {
  return (
    <main className="min-h-screen bg-[#070b14] p-6 text-white md:p-10">
      <Link to="/admin" className="text-blue-400 hover:underline">
        ← Volver al panel
      </Link>

      <h1 className="mt-6 text-3xl font-bold">
        Administrar usuarios
      </h1>

      <p className="mt-3 text-slate-400">
        Desde aquí administraremos los usuarios de CineRolling.
      </p>
    </main>
  );
};
