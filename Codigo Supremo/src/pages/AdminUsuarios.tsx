
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiUsers,
  FiShield,
  FiTrash2,
  FiUser,
  FiRefreshCw,
  FiMail,
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
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

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
        (cuenta): Usuario => ({
          ...cuenta,
          rol: cuenta.rol === "admin" ? "admin" : "user",
        })
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

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cambiarRol = (email: string) => {
    const confirmar = window.confirm(
      "¿Querés cambiar el rol de esta cuenta?"
    );

    if (!confirmar) return;

    const nuevasCuentas: Usuario[] = usuarios.map((usuario) => {
      if (usuario.email.toLowerCase() !== email.toLowerCase()) {
        return usuario;
      }

      return {
        ...usuario,
        rol: usuario.rol === "admin" ? "user" : "admin",
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

    const nuevasCuentas = usuarios.filter(
      (usuario) =>
        usuario.email.toLowerCase() !== email.toLowerCase()
    );

    localStorage.setItem(
      CLAVE_CUENTAS,
      JSON.stringify(nuevasCuentas)
    );

    setUsuarios(nuevasCuentas);
  };

  const totalAdministradores = usuarios.filter(
    (usuario) => usuario.rol === "admin"
  ).length;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:bg-slate-800 hover:text-white"
        >
          <FiArrowLeft />
          Volver al panel
        </Link>

        <div className="mt-6 flex min-w-0 flex-col gap-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
              Administrar usuarios
            </h1>

            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Gestioná las cuentas registradas en CineRolling.
            </p>
          </div>

          <button
            type="button"
            onClick={cargarUsuarios}
            disabled={cargando}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-3 text-sm transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            <FiRefreshCw className={cargando ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6">
          <div className="min-w-0 rounded-xl border border-slate-800 bg-[#101827] p-4 sm:p-5">
            <div className="flex items-center gap-3 text-sm text-slate-400 sm:text-base">
              <FiUsers size={22} className="shrink-0" />
              Total de cuentas
            </div>

            <p className="mt-3 text-3xl font-bold sm:text-4xl">
              {usuarios.length}
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-slate-800 bg-[#101827] p-4 sm:p-5">
            <div className="flex items-center gap-3 text-sm text-slate-400 sm:text-base">
              <FiShield size={22} className="shrink-0" />
              Administradores registrados
            </div>

            <p className="mt-3 text-3xl font-bold sm:text-4xl">
              {totalAdministradores}
            </p>
          </div>
        </div>

        <section className="mt-8 min-w-0 sm:mt-10">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold sm:text-2xl">
              Lista de cuentas
            </h2>

            {!cargando && usuarios.length > 0 && (
              <span className="text-sm text-slate-400">
                {usuarios.length}{" "}
                {usuarios.length === 1 ? "cuenta registrada" : "cuentas registradas"}
              </span>
            )}
          </div>

          {cargando ? (
            <div className="rounded-xl border border-slate-800 bg-[#101827] p-8 text-center text-slate-400">
              <FiRefreshCw className="mx-auto mb-3 animate-spin text-2xl" />
              Cargando usuarios...
            </div>
          ) : usuarios.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-[#101827] p-6 text-center sm:p-8">
              <FiUsers className="mx-auto text-4xl text-slate-500" />

              <p className="mt-4 font-semibold">
                Todavía no hay usuarios registrados.
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Las cuentas creadas desde el formulario de registro aparecerán aquí.
              </p>
            </div>
          ) : (
            <>
              {/* Tarjetas para celulares */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
                {usuarios.map((usuario) => (
                  <article
                    key={usuario.email.toLowerCase()}
                    className="min-w-0 rounded-xl border border-slate-800 bg-[#101827] p-4 sm:p-5"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                        <FiUser size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-semibold">
                          {usuario.nombreUsuario}
                        </h3>

                        <div className="mt-1 flex min-w-0 items-start gap-2 text-sm text-slate-400">
                          <FiMail className="mt-0.5 shrink-0" />
                          <span className="break-all">
                            {usuario.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-800 pt-4">
                      <div>
                        <p className="text-xs text-slate-500">Plan</p>
                        <p className="mt-1 break-words text-sm text-slate-300">
                          {usuario.plan || "Sin plan"}
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 text-xs text-slate-500">Rol</p>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            usuario.rol === "admin"
                              ? "bg-purple-500/15 text-purple-300"
                              : "bg-blue-500/15 text-blue-300"
                          }`}
                        >
                          {usuario.rol === "admin"
                            ? "Administrador"
                            : "Usuario"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-800 pt-4">
                      <button
                        type="button"
                        onClick={() => cambiarRol(usuario.email)}
                        title="Cambiar rol"
                        className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border border-purple-500/40 px-2 py-3 text-sm text-purple-300 transition hover:bg-purple-500/15"
                      >
                        <FiShield className="shrink-0" />
                        <span>Cambiar rol</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => eliminarUsuario(usuario.email)}
                        title="Eliminar usuario"
                        className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border border-red-500/40 px-2 py-3 text-sm text-red-400 transition hover:bg-red-500/15"
                      >
                        <FiTrash2 className="shrink-0" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Tabla para pantallas grandes */}
              <div className="hidden overflow-hidden rounded-xl border border-slate-800 lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
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
                          className="border-t border-slate-800 transition hover:bg-slate-900/60"
                        >
                          <td className="px-5 py-4 font-medium">
                            <span className="flex items-center gap-2">
                              <FiUser className="shrink-0 text-slate-400" />
                              <span className="break-words">
                                {usuario.nombreUsuario}
                              </span>
                            </span>
                          </td>

                          <td className="max-w-xs break-all px-5 py-4 text-slate-300">
                            {usuario.email}
                          </td>

                          <td className="px-5 py-4 text-slate-300">
                            {usuario.plan || "Sin plan"}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
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
                                type="button"
                                onClick={() => cambiarRol(usuario.email)}
                                title="Cambiar rol"
                                aria-label={`Cambiar rol de ${usuario.nombreUsuario}`}
                                className="rounded-lg border border-purple-500/40 p-2 text-purple-300 transition hover:bg-purple-500/15"
                              >
                                <FiShield />
                              </button>

                              <button
                                type="button"
                                onClick={() => eliminarUsuario(usuario.email)}
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
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
};
