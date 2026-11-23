
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
import Plans from "./pages/Plan";

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");

  const [isLogged, setIsLogged] = useState(
    localStorage.getItem("isLogged") === "true",
  );

  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "",
  );

  const handleLogin = (nombreUsuario: string) => {
    localStorage.setItem("isLogged", "true");
    localStorage.setItem("userName", nombreUsuario);

    setUserName(nombreUsuario);
    setIsLogged(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLogged");
    localStorage.removeItem("userName");

    setUserName("");
    setIsLogged(false);
  };

  // Rutas protegidas
  const protect = (element: React.ReactElement) =>
    isLogged ? element : <Navigate to="/login" replace />;

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-[#070b14]">
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLogged={isLogged}
          userName={userName}
          onLogout={handleLogout}
        />

        <div className="flex-1">
          <Routes>
            {/* Página de bienvenida */}
            <Route path="/" element={<Bienvenida />} />

            {/* Inicio: catálogo de películas y series */}
            <Route path="/home" element={protect(<Home />)} />

            {/* Detalles de películas y series */}
            <Route path="/pelicula/:id" element={protect(<DetallePeli />)} />

            {/* Cuenta */}
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

            <Route
              path="/register"
              element={
                isLogged ? <Navigate to="/home" replace /> : <Register />
              }
            />

            {/* Planes */}
            <Route path="/planes" element={<Plans />} />

            {/* Administración */}
            <Route path="/admin" element={protect(<Admin />)} />

            <Route
              path="/admin/peliculas"
              element={protect(<AdminPeliculas />)}
            />

            <Route path="/admin/series" element={protect(<AdminSeries />)} />

            <Route
              path="/admin/usuarios"
              element={protect(<AdminUsuarios />)}
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
