import { NavLink } from "react-router-dom";
import { plans } from "../Data/Plans";

const Plans = () => (
  <section className="min-h-[70vh] bg-[#070b14] px-4 py-12 text-white">
    <div className="mx-auto max-w-6xl">
      <header className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
          CineRolling
        </p>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
          Elegí tu{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
            suscripción
          </span>
        </h1>
        <p className="mt-3 text-slate-300">
          Compará los planes y elegí el que mejor se adapte a vos.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className="flex flex-col rounded-2xl bg-[#0b1220] p-6 ring-1 ring-white/10 transition hover:ring-blue-500/60"
          >
            <h2 className="text-xl font-bold text-white">{plan.name}</h2>
            <p className="mt-3 text-3xl font-bold text-cyan-300">
              {plan.price}
            </p>
            <p className="mt-3 min-h-12 text-sm text-slate-400">
              {plan.description}
            </p>
            <ul className="my-6 flex-1 space-y-2 text-sm text-slate-200">
              {plan.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2">
                  <span className="text-cyan-300">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
            <NavLink
              to={`/register?plan=${plan.id}`}
              className="rounded-full bg-blue-500 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-400"
            >
              Elegir plan
            </NavLink>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Plans;