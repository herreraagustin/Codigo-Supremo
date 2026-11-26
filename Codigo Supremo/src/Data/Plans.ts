import type { Plan } from "../Types/Plan";

export const plans: Plan[] = [
  {
    id: "basico",
    name: "Básico",
    price: "$4.999/mes",
    description: "Ideal para ver en un solo dispositivo.",
    benefits: ["1 pantalla", "Calidad HD", "Catálogo completo"],
  },
  {
    id: "estandar",
    name: "Estándar",
    price: "$7.999/mes",
    description: "Perfecto para compartir con tu familia.",
    benefits: ["2 pantallas", "Calidad Full HD", "Descargas offline"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$10.999/mes",
    description: "La mejor calidad y más pantallas.",
    benefits: ["4 pantallas", "Calidad 4K", "Descargas offline", "Sin anuncios"],
  },
];