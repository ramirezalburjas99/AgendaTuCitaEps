import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

//Envuelve una pantalla protegida. USO <RutaPrivada><Home></RutaPrivada>
export default function RutaPrivada({ children }) {
  const { paciente } = useAuth(); //¿ Alguien esta logueado?

  //Si hay un paciente, muestra la pantalla (children). si no, redirige al login.
  //"replace" evita que el botón "atras" regrese a la pantalla prohibida.
  return paciente ? children : <Navigate to="/inicio" replace />;
}
