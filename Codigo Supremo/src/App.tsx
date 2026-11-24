import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { DetallePeli } from "./pages/DetallePeli";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Admin } from "./pages/Admin";
import { AdminPeliculas } from "./pages/AdminPeliculas";
import { AdminSeries } from "./pages/AdminSeries";
import { AdminUsuarios } from "./pages/AdminUsuarios";
import { Bienvenida } from "./pages/Bienvenida";
import { Error404 } from "./pages/Error404";

import { administradores } from "./Data/Usuarios";

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");

  const [isLogged, setIsLogged] = useState(
    localStorage.getItem("isLogged") === "true",
  );

  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "",
  );

  const [isAdmin, setIsAdmin] = useState(() => {
    const nombreGuardado = localStorage.getItem("userName") || "";

    return (
      localStorage.getItem("isLogged") === "true" &&
      administradores.some(
        (admin) => admin.nombreUsuario === nombreGuardado,
      )
    );
  });

  // Iniciar sesión
  const handleLogin = (nombreUsuario: string) => {
    const esAdmin = administradores.some(
      (admin) => admin.nombreUsuario === nombreUsuario,
    );

    localStorage.setItem("isLogged", "true");
    localStorage.setItem("userName", nombreUsuario);

    setUserName(nombreUsuario);
    setIsLogged(true);
    setIsAdmin(esAdmin);
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("isLogged");
    localStorage.removeItem("userName");

    setUserName("");
    setIsLogged(false);
    setIsAdmin(false);
  };

  // Proteger rutas que requieren iniciar sesión
  const protect = (element: React.ReactElement) =>
    isLogged ? element : <Navigate to="/login" replace />;

  // Proteger rutas exclusivas para administradores
  const protectAdmin = (element: React.ReactElement) => {
    if (!isLogged) {
      return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
      return <Navigate to="/home" replace />;
    }

    return element;
  };

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-[#070b14]">
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLogged={isLogged}
          isAdmin={isAdmin}
          userName={userName}
          onLogout={handleLogout}
        />

        <div className="flex-1">
          <Routes>
            {/* Página de bienvenida */}
            <Route
              path="/"
              element={
                isLogged ? <Navigate to="/home" replace /> : <Bienvenida />
              }
            />

            {/* Catálogo de películas y series */}
            <Route path="/home" element={protect(<Home />)} />

            {/* Detalles de películas y series */}
            <Route path="/pelicula/:id" element={protect(<DetallePeli />)} />

            {/* Inicio de sesión */}
            <Route
              path="/login"
              element={
                isLogged ? (
                  <Navigate to="/home" replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />

            {/* Registro */}
            <Route
              path="/register"
              element={
                isLogged ? <Navigate to="/home" replace /> : <Register />
              }
            />

            {/* Administración: solo administradores */}
            <Route path="/admin" element={protectAdmin(<Admin />)} />

            <Route
              path="/admin/peliculas"
              element={protectAdmin(<AdminPeliculas />)}
            />

            <Route
              path="/admin/series"
              element={protectAdmin(<AdminSeries />)}
            />

            <Route
              path="/admin/usuarios"
              element={protectAdmin(<AdminUsuarios />)}
            />

            {/* Página no encontrada */}
            <Route path="*" element={<Error404 />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}