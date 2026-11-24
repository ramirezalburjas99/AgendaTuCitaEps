import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function BarraSuperior() {
  const { paciente, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const salir = (e) => {
    e.preventDefault();
    cerrarSesion();
    navigate("/inicio");
  };

  return (
    <header className="barra-superior">
      {/* Link cambia de pantalla sin recargar la página completa */}
      <Link to="/home" className="barra-marca">
        <img
          src="/img/LOGO.png"
          alt="logo Agenda Fácil"
          className="barra-logo"
        />
        <span>Agenda Fácil</span>
      </Link>

      <nav className="barra-nav">
        <link to="/home" className="activo">
          Agenda
        </link>
        {/* Pendiente: cuando existan esas pantallas, cambiar "#" por <link to="/"> */}
        <a href="#">Mis citas</a>
        <a href="#">Doctores</a>
        <a href="#">Acerca</a>
      </nav>

      <div className="barra-usuario">
        {/* El circulo muestra la primera letra del nombre del paciente en sesión */}
        <span className="barra-avatar">
          {paciente.nombreCompleto.charAt(0)}
        </span>
        <span className="barra-nombre">{paciente.nombreCompleto}</span>
        <a href="#" onClick={salir} className="barra-salir">
          Cerrar sesión
        </a>
      </div>
    </header>
  );
}
