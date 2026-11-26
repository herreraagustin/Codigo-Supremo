import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./Components/Navbar";
import { Footer } from "./Components/Footer";
import { Home } from "./pages/Home";
import { DetallePeli } from "./pages/DetallePeli";
import { Series } from "./pages/Series";
import { DetalleSerie } from "./pages/DetalleSerie";
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
    setSearchTerm("");
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
      return <Navigate to="/" replace />;
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
            {/* Inicio: bienvenida sin sesión, catálogo con sesión */}
            <Route
              path="/"
              element={isLogged ? <Home /> : <Bienvenida />}
            />

            {/* Mantener compatibilidad con enlaces anteriores */}
            <Route
              path="/home"
              element={<Navigate to="/" replace />}
            />

            {/* Películas: detalle */}
            <Route
              path="/pelicula/:id"
              element={protect(<DetallePeli />)}
            />

            {/* Series: catálogo y detalle */}
            <Route
              path="/series"
              element={protect(<Series searchTerm={searchTerm} />)}
            />

            <Route
              path="/serie/:id"
              element={protect(<DetalleSerie />)}
            />

            {/* Inicio de sesión */}
            <Route
              path="/login"
              element={
                isLogged ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />

            {/* Registro */}
            <Route
              path="/register"
              element={
                isLogged ? <Navigate to="/" replace /> : <Register />
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
