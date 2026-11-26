
export type Usuario = {
  nombreUsuario: string;
  email: string;
  password: string;
  rol: "admin" | "user";
};

export const administradores: Usuario[] = [
  {
    nombreUsuario: import.meta.env.VITE_ADMIN_1_NAME,
    email: import.meta.env.VITE_ADMIN_1_EMAIL,
    password: import.meta.env.VITE_ADMIN_1_PASSWORD,
    rol: "admin",
  },
  {
    nombreUsuario: import.meta.env.VITE_ADMIN_2_NAME,
    email: import.meta.env.VITE_ADMIN_2_EMAIL,
    password: import.meta.env.VITE_ADMIN_2_PASSWORD,
    rol: "admin",
  },
  {
    nombreUsuario: import.meta.env.VITE_ADMIN_3_NAME,
    email: import.meta.env.VITE_ADMIN_3_EMAIL,
    password: import.meta.env.VITE_ADMIN_3_PASSWORD,
    rol: "admin",
  },
];
