
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import { Home } from "./pages/Home";
import { DetallePeli } from "./pages/DetallePeli";
import { Register } from "./pages/Register";
import { Admin } from "./pages/Admin";
import { Footer } from "./components/Footer";

function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <main className="p-6 text-white">
      <h1 className="text-2xl font-bold">Login</h1>

      <button
        onClick={onLogin}
        className="mt-4 rounded bg-blue-500 px-4 py-2 font-semibold"
      >
        Entrar (simulado)
      </button>
    </main>
  );
}

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLogged, setIsLogged] = useState(
    localStorage.getItem("isLogged") === "true"
  );

  const handleLogin = () => {
    localStorage.setItem("isLogged", "true");
    setIsLogged(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLogged");
    setIsLogged(false);
  };

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-[#070b14]">
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLogged={isLogged}
          onLogout={handleLogout}
        />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/login"
              element={<Login onLogin={handleLogin} />}
            />

            <Route
              path="/admin"
              element={<Admin />}
            />

            <Route
              path="/pelicula/:id"
              element={<DetallePeli />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
