
export type Usuario = {
  nombreUsuario: string;
  password: string;
  rol: "admin" | "user";
};

export const administradores: Usuario[] = [
  {
    nombreUsuario: "LataroCadmin",
    password: "123456",
    rol: "admin",
  },
  {
    nombreUsuario: "Agustinadmin",
    password: "123456",
    rol: "admin",
  },
  {
    nombreUsuario: "LautaroLopezadmin",
    password: "123456",
    rol: "admin",
  },
];
