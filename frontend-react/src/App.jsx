import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import Home from "./pages/Home.jsx"; // MODIFICADO
import MisCitas from "./pages/MisCitas.jsx";
import RutaPrivada from "./components/RutaPrivada.jsx"; // MODIFICADO

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inicio" replace />} />
      <Route path="/inicio" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      {/* NUEVO: solo se puede entrar a /home si hay sesión */}
      <Route
        path="/home"
        element={
          <RutaPrivada>
            <Home />
          </RutaPrivada>
        }
      />
      {/* Mis citas: también protegida, solo con sesión iniciada */}
      <Route
        path="/mis-citas"
        element={
          <RutaPrivada>
            <MisCitas />
          </RutaPrivada>
        }
      />
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}
