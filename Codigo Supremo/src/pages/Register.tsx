
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiArrowLeft,
  FiFilm,
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCreditCard,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";
import { plans } from "../Data/Plans";

type Cuenta = {
  nombreUsuario: string;
  email: string;
  password: string;
  rol: "user";
  plan: string;
};

const obtenerCuentas = (): Cuenta[] => {
  try {
    const cuentasGuardadas = localStorage.getItem("cuentas");
    return cuentasGuardadas ? JSON.parse(cuentasGuardadas) : [];
  } catch {
    return [];
  }
};

export const Register = () => {
  const navigate = useNavigate();

  const [paso, setPaso] = useState(1);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [planSeleccionado, setPlanSeleccionado] = useState("basico");
  const [titular, setTitular] = useState("");
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cvv, setCvv] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");

  const planActual =
    plans.find((plan) => plan.id === planSeleccionado) ?? plans[0];

  const validarRegistro = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (nombreUsuario.trim().length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresá un correo electrónico válido.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const cuentas = obtenerCuentas();

    const correoExiste = cuentas.some(
      (cuenta) => cuenta.email.toLowerCase() === email.trim().toLowerCase(),
    );

    const usuarioExiste = cuentas.some(
      (cuenta) =>
        cuenta.nombreUsuario.toLowerCase() ===
        nombreUsuario.trim().toLowerCase(),
    );

    if (correoExiste || usuarioExiste) {
      setError(
        correoExiste
          ? "Ya existe una cuenta registrada con ese correo."
          : "Ese nombre de usuario ya está en uso.",
      );
      return;
    }

    setPaso(2);
  };

  const confirmarRegistro = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (titular.trim().length < 3) {
      setError("Ingresá el nombre del titular.");
      return;
    }

    const digitosTarjeta = numeroTarjeta.replace(/\D/g, "");

    if (digitosTarjeta.length < 12 || digitosTarjeta.length > 19) {
      setError("El número debe contener entre 12 y 19 dígitos.");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(vencimiento)) {
      setError("Ingresá el vencimiento en formato MM/AA.");
      return;
    }

    const mes = Number(vencimiento.split("/")[0]);

    if (mes < 1 || mes > 12) {
      setError("El mes de vencimiento debe estar entre 01 y 12.");
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      setError("El código de seguridad debe tener 3 o 4 dígitos.");
      return;
    }

    const cuentas = obtenerCuentas();

    const cuentaDuplicada = cuentas.some(
      (cuenta) =>
        cuenta.email.toLowerCase() === email.trim().toLowerCase() ||
        cuenta.nombreUsuario.toLowerCase() ===
          nombreUsuario.trim().toLowerCase(),
    );

    if (cuentaDuplicada) {
      setError("El usuario o correo ya está registrado. Volvé al registro.");
      setPaso(1);
      return;
    }

    const nuevaCuenta: Cuenta = {
      nombreUsuario: nombreUsuario.trim(),
      email: email.trim().toLowerCase(),
      password,
      rol: "user",
      plan: planSeleccionado,
    };

    try {
      localStorage.setItem(
        "cuentas",
        JSON.stringify([...cuentas, nuevaCuenta]),
      );

      const resultado = await Swal.fire({
        title: "¡Todo listo!",
        text: "Tu cuenta se registró correctamente. Ahora podés iniciar sesión.",
        icon: "success",
        confirmButtonText: "Ir a iniciar sesión",
        confirmButtonColor: "#22d3ee",
        background: "#0d1423",
        color: "#ffffff",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      if (resultado.isConfirmed) {
        navigate("/login");
      }
    } catch {
      setError(
        "No se pudo completar el registro. Revisá el almacenamiento disponible en tu navegador.",
      );
    }
  };

  return (
    <main className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-[#070b14] px-4 py-12 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />

      <section className="relative w-full max-w-2xl">
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
              <FiFilm size={32} className="text-cyan-300" />
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
              CineRolling
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              {paso === 1 ? "Crear una cuenta" : "Elegí tu plan"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {paso === 1
                ? "Registrate para empezar a disfrutar de nuestro catálogo."
                : "Seleccioná tu suscripción y completá el formulario."}
            </p>

            <div className="mx-auto mt-6 flex max-w-xs items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full font-bold ${
                  paso === 1
                    ? "bg-cyan-400 text-[#07111d]"
                    : "bg-cyan-400/20 text-cyan-300"
                }`}
              >
                1
              </div>

              <div className="h-1 flex-1 rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full bg-cyan-400 transition-all ${
                    paso === 2 ? "w-full" : "w-0"
                  }`}
                />
              </div>

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full font-bold ${
                  paso === 2
                    ? "bg-cyan-400 text-[#07111d]"
                    : "bg-white/10 text-slate-400"
                }`}
              >
                2
              </div>
            </div>
          </div>

          {paso === 1 ? (
            <form onSubmit={validarRegistro} className="space-y-5">
              <div>
                <label
                  htmlFor="nombreUsuario"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Nombre de usuario
                </label>

                <div className="relative">
                  <FiUser
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="nombreUsuario"
                    type="text"
                    value={nombreUsuario}
                    onChange={(e) => setNombreUsuario(e.target.value)}
                    placeholder="Elegí un nombre de usuario"
                    autoComplete="username"
                    minLength={3}
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#080e19] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Correo electrónico
                </label>

                <div className="relative">
                  <FiMail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    autoComplete="email"
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
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="password"
                    type={mostrarPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    minLength={6}
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

              <div>
                <label
                  htmlFor="confirmarPassword"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Confirmar contraseña
                </label>

                <div className="relative">
                  <FiLock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="confirmarPassword"
                    type={mostrarPassword ? "text" : "password"}
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    placeholder="Volvé a ingresar tu contraseña"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#080e19] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
                  />
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 font-bold text-[#07111d] transition hover:bg-cyan-300"
              >
                Continuar al plan
                <FiArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={confirmarRegistro} className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setPlanSeleccionado(plan.id)}
                    className={`rounded-xl border p-4 text-left transition ${
                      planSeleccionado === plan.id
                        ? "border-cyan-400 bg-cyan-400/10 ring-2 ring-cyan-400/20"
                        : "border-white/10 bg-[#080e19] hover:border-white/20"
                    }`}
                  >
                    <span className="block text-sm font-bold">{plan.name}</span>
                    <span className="mt-2 block text-lg font-bold text-cyan-300">
                      {plan.price.split("/")[0]}
                    </span>
                    <span className="text-xs text-slate-400">por mes</span>

                    <ul className="mt-3 space-y-1">
                      {plan.benefits.map((beneficio) => (
                        <li
                          key={beneficio}
                          className="text-xs text-slate-400"
                        >
                          • {beneficio}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                <div className="flex items-center gap-3">
                  <FiCreditCard size={22} className="text-cyan-300" />

                  <div className="flex-1">
                    <p className="font-semibold">Resumen de tu suscripción</p>
                    <p className="text-sm text-slate-400">
                      {planActual.name}
                    </p>
                  </div>

                  <p className="font-bold text-cyan-300">{planActual.price}</p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="titular"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Nombre del titular
                </label>

                <input
                  id="titular"
                  type="text"
                  value={titular}
                  onChange={(e) => setTitular(e.target.value)}
                  placeholder="Nombre del titular"
                  autoComplete="off"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#080e19] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                />
              </div>

              <div>
                <label
                  htmlFor="numeroTarjeta"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Número de tarjeta
                </label>

                <input
                  id="numeroTarjeta"
                  type="text"
                  inputMode="numeric"
                  value={numeroTarjeta}
                  onChange={(e) =>
                    setNumeroTarjeta(
                      e.target.value.replace(/\D/g, "").slice(0, 19),
                    )
                  }
                  placeholder="Ingresá el número de tarjeta"
                  autoComplete="off"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#080e19] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="vencimiento"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Vencimiento (MM/AA)
                  </label>

                  <input
                    id="vencimiento"
                    type="text"
                    value={vencimiento}
                    onChange={(e) =>
                      setVencimiento(
                        e.target.value.replace(/[^\d/]/g, "").slice(0, 5),
                      )
                    }
                    placeholder="MM/AA"
                    autoComplete="off"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#080e19] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cvv"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Código de seguridad
                  </label>

                  <input
                    id="cvv"
                    type="password"
                    inputMode="numeric"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="3 o 4 dígitos"
                    autoComplete="off"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#080e19] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                  />
                </div>
              </div>

              <p className="text-xs leading-5 text-slate-400">
                Este formulario es una simulación académica: no procesa pagos.
                No ingreses datos de una tarjeta real.
              </p>

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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 font-bold text-[#07111d] transition hover:bg-cyan-300"
              >
                <FiShield size={18} />
                Confirmar registro
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setPaso(1);
                }}
                className="w-full py-2 text-sm text-slate-400 transition hover:text-cyan-300"
              >
                Volver a los datos de la cuenta
              </button>
            </form>
          )}

          <div className="mt-7 border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-slate-400">
              ¿Ya tenés una cuenta?{" "}
              <Link
                to="/login"
                className="font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                Iniciá sesión
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
