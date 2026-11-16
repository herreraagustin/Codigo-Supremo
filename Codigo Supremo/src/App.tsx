import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Components/Navbar";

function Home({ searchTerm }: { searchTerm: string}) {
  return (
    <main className="p-6 text-white">
      <h1 className="text-2xl font-bold">Home</h1>
      <p className="text-slate-400">Buscando: {searchTerm || "(nada)"}</p>
    </main>
  );
}

function Admin() {
  return (
    <main className="p-6 text-white">
      <h1 className="text-2xl font-bold">Panel de Admnistracion</h1>
    </main>
  );
}

function Login ({onLogin}: {onLogin: () => void}) {
  return (
    <main className="p-6 text-white">
      <h1 className="text-2xl font-bold">Login</h1>
      <button onClick={onLogin} className="mt-4 rounded bg-blue-500 px-4 py-2 font-semibold">
        Entrar (simulado)
      </button>
    </main>
  );
}

export default function App() {
  const [ searchTerm, setSearchTerm] = useState("");
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
    <div className="min-h-screen bg-[#070b14]">
      <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLogged={isLogged}
          onLogout={handleLogout}
        />
       <Routes>
          <Route path="/" element={<Home searchTerm={searchTerm} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/admin"
            element={isLogged ? <Admin /> : <Navigate to="/login" replace />}
          />
        </Routes>
    </div>
    </BrowserRouter>
  )
}

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Home } from "./pages/Home";
import { DetallePeli } from "./pages/DetallePeli";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Footer } from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pelicula/:id" element={<DetallePeli />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;

