
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiUsers,
  FiShield,
  FiTrash2,
  FiUser,
  FiRefreshCw,
} from "react-icons/fi";

type RolUsuario = "admin" | "user";

type Usuario = {
  nombreUsuario: string;
  email: string;
  password: string;
  rol: RolUsuario;
  plan?: string;
};

const CLAVE_CUENTAS = "cuentas";

export const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    try {
      const datos = localStorage.getItem(CLAVE_CUENTAS);
      if (!datos) return [];

      const cuentas: Usuario[] = JSON.parse(datos);
      return cuentas.map((cuenta): Usuario => ({
        ...cuenta,
        rol: cuenta.rol === "admin" ? "admin" : "user",
      }));
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      return [];
    }
  });
  const [cargando, setCargando] = useState(false);

  const cargarUsuarios = () => {
    setCargando(true);

    try {
      const datos = localStorage.getItem(CLAVE_CUENTAS);

      if (!datos) {
        setUsuarios([]);
        return;
      }

      const cuentas: Usuario[] = JSON.parse(datos);

      const cuentasNormalizadas: Usuario[] = cuentas.map(
        (cuenta): Usuario => {
          const rol: RolUsuario =
            cuenta.rol === "admin" ? "admin" : "user";

          return {
            ...cuenta,
            rol,
          };
        }
      );

      setUsuarios(cuentasNormalizadas);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setUsuarios([]);
      alert("No se pudieron cargar las cuentas guardadas.");
    } finally {
      setCargando(false);
    }
  };

  const cambiarRol = (email: string) => {
    const confirmar = window.confirm(
      "¿Querés cambiar el rol de esta cuenta?"
    );

    if (!confirmar) return;

    const nuevasCuentas: Usuario[] = usuarios.map((usuario) => {
      if (
        usuario.email.toLowerCase() !== email.toLowerCase()
      ) {
        return usuario;
      }

      const nuevoRol: RolUsuario =
        usuario.rol === "admin" ? "user" : "admin";

      return {
        ...usuario,
        rol: nuevoRol,
      };
    });

    localStorage.setItem(
      CLAVE_CUENTAS,
      JSON.stringify(nuevasCuentas)
    );

    setUsuarios(nuevasCuentas);
  };

  const eliminarUsuario = (email: string) => {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar la cuenta ${email}? Esta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    const nuevasCuentas: Usuario[] = usuarios.filter(
      (usuario) =>
        usuario.email.toLowerCase() !== email.toLowerCase()
    );

    localStorage.setItem(
      CLAVE_CUENTAS,
      JSON.stringify(nuevasCuentas)
    );

    setUsuarios(nuevasCuentas);
  };

  return (
    <main className="min-h-screen bg-[#070b14] p-6 text-white md:p-10">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-blue-400 hover:underline"
      >
        <FiArrowLeft />
        Volver al panel
      </Link>

      <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Administrar usuarios
          </h1>

          <p className="mt-2 text-slate-400">
            Gestioná las cuentas registradas en CineRolling.
          </p>
        </div>

        <button
          onClick={cargarUsuarios}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 transition hover:bg-slate-800"
        >
          <FiRefreshCw />
          Actualizar
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-[#101827] p-5">
          <div className="flex items-center gap-3 text-slate-400">
            <FiUsers size={22} />
            Total de cuentas
          </div>

          <p className="mt-3 text-3xl font-bold">
            {usuarios.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#101827] p-5">
          <div className="flex items-center gap-3 text-slate-400">
            <FiShield size={22} />
            Administradores registrados
          </div>

          <p className="mt-3 text-3xl font-bold">
            {
              usuarios.filter(
                (usuario) => usuario.rol === "admin"
              ).length
            }
          </p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">
          Lista de cuentas
        </h2>

        {cargando ? (
          <p className="text-slate-400">
            Cargando usuarios...
          </p>
        ) : usuarios.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#101827] p-8 text-center">
            <FiUsers className="mx-auto text-4xl text-slate-500" />

            <p className="mt-4 font-semibold">
              Todavía no hay usuarios registrados.
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Las cuentas creadas desde el formulario de registro aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-[#101827] text-sm text-slate-400">
                <tr>
                  <th className="px-5 py-4">Usuario</th>
                  <th className="px-5 py-4">Correo</th>
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Rol</th>
                  <th className="px-5 py-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((usuario) => (
                  <tr
                    key={usuario.email.toLowerCase()}
                    className="border-t border-slate-800"
                  >
                    <td className="px-5 py-4 font-medium">
                      <span className="flex items-center gap-2">
                        <FiUser className="text-slate-400" />
                        {usuario.nombreUsuario}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {usuario.email}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {usuario.plan || "Sin plan"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          usuario.rol === "admin"
                            ? "bg-purple-500/15 text-purple-300"
                            : "bg-blue-500/15 text-blue-300"
                        }`}
                      >
                        {usuario.rol === "admin"
                          ? "Administrador"
                          : "Usuario"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            cambiarRol(usuario.email)
                          }
                          title="Cambiar rol"
                          aria-label={`Cambiar rol de ${usuario.nombreUsuario}`}
                          className="rounded-lg border border-purple-500/40 p-2 text-purple-300 transition hover:bg-purple-500/15"
                        >
                          <FiShield />
                        </button>

                        <button
                          onClick={() =>
                            eliminarUsuario(usuario.email)
                          }
                          title="Eliminar usuario"
                          aria-label={`Eliminar a ${usuario.nombreUsuario}`}
                          className="rounded-lg border border-red-500/40 p-2 text-red-400 transition hover:bg-red-500/15"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};
