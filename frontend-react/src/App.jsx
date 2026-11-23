import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";

export default function App() {
  return (
    <Routes>
      {/*La raíz "/" redirige al login */}
      <Route path="/" element={<Navigate to="/inicio" replace />} />
      <Route path="/inicio" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      {/* Cualquier otra URL También va al login */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}
