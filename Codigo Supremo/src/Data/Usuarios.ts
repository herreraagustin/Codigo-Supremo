
export type Usuario = {
  nombreUsuario: string;
  email: string;
  password: string;
  rol: "admin" | "user";
};

export const administradores: Usuario[] = [
  {
    nombreUsuario: "LataroCadmin",
    email: "latarocadmin@cinerolling.com",
    password: "123456",
    rol: "admin",
  },
  {
    nombreUsuario: "Agustinadmin",
    email: "agustinadmin@cinerolling.com",
    password: "123456",
    rol: "admin",
  },
  {
    nombreUsuario: "LautaroLopezadmin",
    email: "lautaro.lopezadmin@cinerolling.com",
    password: "123456",
    rol: "admin",
  },
];
