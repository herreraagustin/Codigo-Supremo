
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

    let cuentasRegistradas: CuentaRegistrada[];

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
    <main className="relative flex min-h-[80vh] min-h-[80dvh] items-center justify-center overflow-hidden bg-[#070b14] px-4 py-8 text-white sm:px-6 sm:py-12 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl sm:-left-32 sm:-top-32 sm:h-80 sm:w-80"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-blue-600/10 blur-3xl sm:-bottom-32 sm:-right-32 sm:h-80 sm:w-80"
      />

      <section className="relative z-10 mx-auto w-full max-w-md min-w-0">
        <Link
          to="/"
          className="mb-5 inline-flex min-h-10 max-w-full items-center gap-2 rounded-lg text-sm text-slate-400 transition hover:text-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 sm:mb-7"
        >
          <FiArrowLeft size={17} className="shrink-0" />
          <span>Volver al inicio</span>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-[#0d1423]/95 p-5 shadow-2xl shadow-black/30 sm:p-7 md:p-9">
          <div className="mb-7 text-center sm:mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 sm:mb-5 sm:h-16 sm:w-16">
              <span className="text-cyan-300">
                <FiFilm size={30} />
              </span>
            </div>

            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300 sm:text-xs sm:tracking-[0.25em]">
              CineRolling
            </p>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Iniciar sesión
            </h1>

            <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-400">
              Ingresá tus datos para acceder a tu cuenta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="min-w-0">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium leading-5 text-slate-200"
              >
                Correo electrónico o usuario administrador
              </label>

              <div className="relative">
                <FiMail
                  size={18}
                  aria-hidden="true"
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
                  className="min-h-12 w-full min-w-0 rounded-xl border border-white/10 bg-[#080e19] py-3 pl-11 pr-3 text-base text-white outline-none transition placeholder:text-sm placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 sm:pr-4 sm:text-sm"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Contraseña
              </label>

              <div className="relative">
                <FiLock
                  size={18}
                  aria-hidden="true"
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
                  className="min-h-12 w-full min-w-0 rounded-xl border border-white/10 bg-[#080e19] py-3 pl-11 pr-12 text-base text-white outline-none transition placeholder:text-sm placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 sm:text-sm"
                />

                <button
                  type="button"
                  onClick={() => setMostrarPassword((actual) => !actual)}
                  aria-label={
                    mostrarPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  aria-pressed={mostrarPassword}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:text-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
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
                className="flex min-w-0 items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm leading-5 text-red-300 sm:p-4"
              >
                <FiAlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <p className="min-w-0 break-words">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-[#07111d] transition hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 active:scale-[0.99] sm:text-base"
            >
              <FiLogIn size={19} aria-hidden="true" />
              Ingresar a CineRolling
            </button>
          </form>

          <div className="mt-5 flex min-w-0 items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 sm:mt-6 sm:p-4">
            <FiShield
              size={20}
              className="mt-0.5 shrink-0 text-cyan-300"
              aria-hidden="true"
            />

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200">
                Acceso protegido
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
                Ingresá con el correo de tu cuenta registrada.
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5 text-center sm:mt-7 sm:pt-6">
            <p className="text-sm leading-6 text-slate-400">
              ¿Todavía no tenés una cuenta?{" "}
              <Link
                to="/register"
                className="inline-block font-semibold text-cyan-300 transition hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              >
                Registrate
              </Link>
            </p>
          </div>
        </div>

        <p className="mx-auto mt-5 flex max-w-sm items-start justify-center gap-2 px-2 text-center text-xs leading-5 text-slate-500 sm:items-center sm:text-sm">
          <FiHelpCircle size={14} className="mt-0.5 shrink-0 sm:mt-0" />
          <span>¿Necesitás ayuda? Contactá al administrador.</span>
        </p>
      </section>
    </main>
  );
};
