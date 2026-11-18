import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Home } from "./pages/Home";
import { DetallePeli } from "./pages/DetallePeli";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Footer } from "./components/Footer";

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");

  const [isLogged, setIsLogged] = useState(
    localStorage.getItem("isLogged") === "true"
  );

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
          <Route path="/" element={<Home />} />

          <Route
            path="/pelicula/:id"
            element={<DetallePeli />}
          />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />
        </Routes>

        <Footer />

      </div>
    </BrowserRouter>
  );
}
