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
import { plans } from "../data/Plans";

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

    if (correoExiste) {
      setError("Ya existe una cuenta registrada con ese correo.");
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

    const [mesTexto, anioTexto] = vencimiento.split("/");
    const mes = Number(mesTexto);
    const anio = Number(`20${anioTexto}`);

    if (mes < 1 || mes > 12) {
      setError("El mes de vencimiento debe estar entre 01 y 12.");
      return;
    }

    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth() + 1;

    if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
      setError("La tarjeta está vencida. Ingresá una fecha válida.");
      return;
    }

    if (anio > 2040) {
      setError("El año de vencimiento no puede superar el 40 (2040).");
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      setError("El código de seguridad debe tener 3 o 4 dígitos.");
      return;
    }

    const cuentas = obtenerCuentas();

    const cuentaDuplicada = cuentas.some(
      (cuenta) => cuenta.email.toLowerCase() === email.trim().toLowerCase(),
    );

    if (cuentaDuplicada) {
      setError(
        "Ya existe una cuenta registrada con ese correo. Volvé al registro.",
      );
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
    <main className="relative flex min-h-[80vh] min-h-[80dvh] items-center justify-center overflow-hidden bg-[#070b14] px-3 py-8 text-white sm:px-6 sm:py-12 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl sm:-left-32 sm:-top-32 sm:h-80 sm:w-80"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-blue-600/10 blur-3xl sm:-bottom-32 sm:-right-32 sm:h-80 sm:w-80"
      />

      <section className="relative z-10 mx-auto w-full max-w-2xl min-w-0">
        <Link
          to="/"
          className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm text-slate-400 transition hover:text-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 sm:mb-7"
        >
          <FiArrowLeft size={17} className="shrink-0" />
          <span>Volver al inicio</span>
        </Link>

        <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0d1423]/95 p-4 shadow-2xl shadow-black/30 sm:p-6 md:p-9">
          <div className="mb-7 text-center sm:mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 sm:mb-5 sm:h-16 sm:w-16">
              <FiFilm size={30} className="text-cyan-300 sm:hidden" />
              <FiFilm size={32} className="hidden text-cyan-300 sm:block" />
            </div>

            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300 sm:text-xs sm:tracking-[0.25em]">
              CineRolling
            </p>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {paso === 1 ? "Crear una cuenta" : "Elegí tu plan"}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400 sm:text-base">
              {paso === 1
                ? "Registrate para empezar a disfrutar de nuestro catálogo."
                : "Seleccioná tu suscripción y completá el formulario."}
            </p>

            <div
              className="mx-auto mt-6 flex max-w-xs items-center gap-3"
              aria-label={`Paso ${paso} de 2`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold ${
                  paso === 1
                    ? "bg-cyan-400 text-[#07111d]"
                    : "bg-cyan-400/20 text-cyan-300"
                }`}
              >
                1
              </div>

              <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full bg-cyan-400 transition-all duration-300 ${
                    paso === 2 ? "w-full" : "w-0"
                  }`}
                />
              </div>

              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold ${
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
            <form onSubmit={validarRegistro} className="space-y-4 sm:space-y-5">
              <div className="min-w-0">
                <label
                  htmlFor="nombreUsuario"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Nombre de usuario
                </label>

                <div className="relative">
                  <FiUser
                    size={18}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="nombreUsuario"
                    type="text"
                    value={nombreUsuario}
                    onChange={(e) => {
                      setNombreUsuario(e.target.value);
                      setError("");
                    }}
                    placeholder="Elegí un nombre de usuario"
                    autoComplete="username"
                    minLength={3}
                    required
                    className="min-h-12 w-full min-w-0 rounded-xl border border-white/10 bg-[#080e19] py-3 pl-11 pr-3 text-base text-white outline-none transition placeholder:text-sm placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 sm:pr-4 sm:text-sm"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Correo electrónico
                </label>

                <div className="relative">
                  <FiMail
                    size={18}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="tucorreo@ejemplo.com"
                    autoComplete="email"
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
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    minLength={6}
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

              <div className="min-w-0">
                <label
                  htmlFor="confirmarPassword"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Confirmar contraseña
                </label>

                <div className="relative">
                  <FiLock
                    size={18}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="confirmarPassword"
                    type={mostrarPassword ? "text" : "password"}
                    value={confirmarPassword}
                    onChange={(e) => {
                      setConfirmarPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Volvé a ingresar tu contraseña"
                    autoComplete="new-password"
                    required
                    className="min-h-12 w-full min-w-0 rounded-xl border border-white/10 bg-[#080e19] py-3 pl-11 pr-3 text-base text-white outline-none transition placeholder:text-sm placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 sm:pr-4 sm:text-sm"
                  />
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
                Continuar al plan
                <FiArrowRight size={18} aria-hidden="true" />
              </button>
            </form>
          ) : (
            <form
              onSubmit={confirmarRegistro}
              className="space-y-5 sm:space-y-6"
            >
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setPlanSeleccionado(plan.id)}
                    aria-pressed={planSeleccionado === plan.id}
                    className={`min-w-0 rounded-xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                      planSeleccionado === plan.id
                        ? "border-cyan-400 bg-cyan-400/10 ring-2 ring-cyan-400/20"
                        : "border-white/10 bg-[#080e19] hover:border-white/20"
                    }`}
                  >
                    <span className="block break-words text-sm font-bold">
                      {plan.name}
                    </span>

                    <span className="mt-2 block break-words text-lg font-bold text-cyan-300">
                      {plan.price.split("/")[0]}
                    </span>

                    <span className="text-xs text-slate-400">por mes</span>

                    <ul className="mt-3 space-y-2">
                      {plan.benefits.map((beneficio) => (
                        <li
                          key={beneficio}
                          className="break-words text-xs leading-5 text-slate-400"
                        >
                          • {beneficio}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 sm:p-4">
                <div className="flex min-w-0 items-start gap-3">
                  <FiCreditCard
                    size={22}
                    className="mt-0.5 shrink-0 text-cyan-300"
                    aria-hidden="true"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold sm:text-base">
                      Resumen de tu suscripción
                    </p>
                    <p className="mt-1 break-words text-sm text-slate-400">
                      {planActual.name}
                    </p>
                  </div>

                  <p className="shrink-0 break-words text-right text-sm font-bold text-cyan-300 sm:text-base">
                    {planActual.price}
                  </p>
                </div>
              </div>

              <div className="min-w-0">
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
                  onChange={(e) => {
                    setTitular(e.target.value);
                    setError("");
                  }}
                  placeholder="Nombre del titular"
                  autoComplete="off"
                  required
                  className="min-h-12 w-full min-w-0 rounded-xl border border-white/10 bg-[#080e19] px-3 py-3 text-base text-white outline-none transition placeholder:text-sm placeholder:text-slate-600 focus:border-cyan-400 sm:px-4 sm:text-sm"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="numeroTarjeta"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Número de tarjeta (simulado)
                </label>

                <input
                  id="numeroTarjeta"
                  type="text"
                  inputMode="numeric"
                  value={numeroTarjeta}
                  onChange={(e) => {
                    setNumeroTarjeta(
                      e.target.value.replace(/\D/g, "").slice(0, 19),
                    );
                    setError("");
                  }}
                  placeholder="Ingresá un número de prueba"
                  autoComplete="off"
                  required
                  className="min-h-12 w-full min-w-0 rounded-xl border border-white/10 bg-[#080e19] px-3 py-3 text-base text-white outline-none transition placeholder:text-sm placeholder:text-slate-600 focus:border-cyan-400 sm:px-4 sm:text-sm"
                />
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <label
                    htmlFor="vencimiento"
                    className="mb-2 block text-sm font-medium leading-5 text-slate-200"
                  >
                    Vencimiento (MM/AA)
                  </label>

                  <input
                    id="vencimiento"
                    type="text"
                    inputMode="numeric"
                    value={vencimiento}
                    onChange={(e) => {
                      setVencimiento(
                        e.target.value.replace(/[^\d/]/g, "").slice(0, 5),
                      );
                      setError("");
                    }}
                    placeholder="MM/AA"
                    autoComplete="off"
                    required
                    className="min-h-12 w-full min-w-0 rounded-xl border border-white/10 bg-[#080e19] px-3 py-3 text-base text-white outline-none transition placeholder:text-sm placeholder:text-slate-600 focus:border-cyan-400 sm:px-4 sm:text-sm"
                  />
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="cvv"
                    className="mb-2 block text-sm font-medium leading-5 text-slate-200"
                  >
                    Código de seguridad
                  </label>

                  <input
                    id="cvv"
                    type="password"
                    inputMode="numeric"
                    value={cvv}
                    onChange={(e) => {
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 4));
                      setError("");
                    }}
                    placeholder="3 o 4 dígitos"
                    autoComplete="off"
                    required
                    className="min-h-12 w-full min-w-0 rounded-xl border border-white/10 bg-[#080e19] px-3 py-3 text-base text-white outline-none transition placeholder:text-sm placeholder:text-slate-600 focus:border-cyan-400 sm:px-4 sm:text-sm"
                  />
                </div>
              </div>

              <p className="rounded-lg border border-amber-400/10 bg-amber-400/5 p-3 text-xs leading-5 text-slate-400">
                Esta es una simulación académica y no procesa pagos. No ingreses
                datos de una tarjeta real; utilizá datos ficticios para probar
                el formulario.
              </p>

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
                <FiShield size={18} aria-hidden="true" />
                Confirmar registro
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setPaso(1);
                }}
                className="min-h-11 w-full rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:text-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
              >
                Volver a los datos de la cuenta
              </button>
            </form>
          )}

          <div className="mt-6 border-t border-white/10 pt-5 text-center sm:mt-7 sm:pt-6">
            <p className="text-sm leading-6 text-slate-400">
              ¿Ya tenés una cuenta?{" "}
              <Link
                to="/login"
                className="inline-block font-semibold text-cyan-300 transition hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
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
