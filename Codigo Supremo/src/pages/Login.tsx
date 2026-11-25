import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiFilm,
  FiAlertCircle,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiHelpCircle,
  FiLogIn,
  FiShield,
} from "react-icons/fi";

import { administradores } from "../Data/Usuarios";

type LoginProps = {
  onLogin: (nombreUsuario: string) => void;
};

type CuentaRegistrada = {
  nombreUsuario: string;
  email: string;
  password: string;
  rol: "user";
  plan: string;
};

export const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const emailIngresado = email.trim().toLowerCase();

    const administradorEncontrado = administradores.find(
      (usuario) =>
        (usuario.email.toLowerCase() === emailIngresado ||
          usuario.nombreUsuario.toLowerCase() === emailIngresado) &&
        usuario.password === password,
    );

    if (administradorEncontrado) {
      onLogin(administradorEncontrado.nombreUsuario);
      return;
    }

    let cuentasRegistradas: CuentaRegistrada[] = [];

    try {
      const datosGuardados = localStorage.getItem("cuentas");
      cuentasRegistradas = datosGuardados
        ? (JSON.parse(datosGuardados) as CuentaRegistrada[])
        : [];
    } catch {
      setError(
        "No se pudieron leer las cuentas guardadas. Intentá nuevamente.",
      );
      return;
    }

    const cuentaEncontrada = cuentasRegistradas.find(
      (cuenta) =>
        cuenta.email.toLowerCase() === emailIngresado &&
        cuenta.password === password &&
        cuenta.rol === "user",
    );

    if (!cuentaEncontrada) {
      setError("El correo electrónico o la contraseña son incorrectos.");
      return;
    }

    onLogin(cuentaEncontrada.nombreUsuario);
  };

  return (
    <main className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-[#070b14] px-4 py-12 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />

      <section className="relative w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-300"
        >
          <FiArrowLeft size={17} />
          Volver al inicio
        </Link>

        <div className="rounded-2xl border border-white/10 bg-[#0d1423]/95 p-6 shadow-2xl shadow-black/30 sm:p-9">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <span className="text-cyan-300">
                <FiFilm size={32} />
              </span>
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
              CineRolling
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Iniciar sesión
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Ingresá tus datos para acceder a tu cuenta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Correo electrónico o usuario administrador
              </label>

              <div className="relative">
                <FiMail
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="username"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#080e19] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Contraseña
              </label>

              <div className="relative">
                <FiLock
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Ingresá tu contraseña"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#080e19] py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
                />

                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label={
                    mostrarPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-cyan-300"
                >
                  {mostrarPassword ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
              >
                <FiAlertCircle size={19} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 font-bold text-[#07111d] transition hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              <FiLogIn size={19} />
              Ingresar a CineRolling
            </button>
          </form>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4">
            <FiShield size={20} className="mt-0.5 shrink-0 text-cyan-300" />

            <div>
              <p className="text-sm font-semibold text-slate-200">
                Acceso protegido
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Ingresá con el correo de tu cuenta registrada.
              </p>
            </div>
          </div>

          <div className="mt-7 border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-slate-400">
              ¿Todavía no tenés una cuenta?{" "}
              <Link
                to="/register"
                className="font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                Registrate
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
          <FiHelpCircle size={14} />
          ¿Necesitás ayuda? Contactá al administrador.
        </p>
      </section>
    </main>
  );
};