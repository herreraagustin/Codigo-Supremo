
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

