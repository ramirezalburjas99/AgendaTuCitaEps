import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import usePageStyles from "../hooks/usePageStyles.js";
import { iniciarSesion } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

// Esta pantalla usa style.css (se quita al salir de ella)
export default function Login() {
  usePageStyles(["style.css"]);

  const navigate = useNavigate();
  const location = useLocation();
  const { guardarSesion } = useAuth();

  //"Estado": valores que, al cambiar, hacen que React vuelva a dibujas la pantalla
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState(""); // mensaje de error que se muestra
  const [cargando, setCargando] = useState(false); // true mientras espera al servidor

  // Mensaje que envia la pantalla de registro al terminar (antes era un flashAttribute de Spring)
  const exito = location.state?.exito;

  // Se ejecuta al presionar "Iniciar Sesión"
  const enviar = async (e) => {
    e.preventDefault();

    setError("");
    setCargando(true);
    try {
      const paciente = await iniciarSesion(correo, contrasena);
      guardarSesion(paciente); // recuerda quién entró
      navigate("/home"); // equivale a "redirect:/home"
    } catch (err) {
      setError(err.message); // muestra "Correo o contraseña incorrectos", etc.
    } finally {
      setCargando(false);
    }
  };
  return (
    <>
      {/* Aviso verde: solo aparece si venimos del registro */}
      {exito && (
        <div className="alert alert-success">
          <p>{exito}</p>
        </div>
      )}
      {/* Aviso rojo: solo aparece si hubo un error */}
      {error && (
        <div className="alert alert-danger">
          <p>{error}</p>
        </div>
      )}

      <div className="login-container">
        <div className="card">
          <div className="card-header" style={{ textAlign: "center" }}>
            <img
              src="/img/LOGO.png"
              alt="logo-Citas"
              style={{ maxWidth: 120, marginBottom: "1rem" }}
            />
            <h1 className="page-title">Agenda Fácil</h1>
            <p className="description">Organiza tus citas sin complicaciones</p>
            {/* Link cambia de pantalla sinn recargar (reempla al <a href> de Thymealeaf) */}
            <Link className="enlace-auto-registro" to="/registro">
              Registrate aquí
            </Link>
          </div>
          <div className="card-body">
            {/* onSubmit llama a nuetra función "enviar" en vez de enviar el form a Spring */}
            <form onSubmit={enviar}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Correo Electrónico <span className="required">*</span>
                </label>
                {/* value + onChange = el input siempre refleja la variable "correo*/}
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="Jose@gmail.com"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
              <div className="form.group">
                <label className="form-label" htmlFor="password">
                  Contraseña <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder="********"
                  required
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
              </div>
              {/* diabled evita dar clic dos veces mientras se espera al servidor*/}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%" }}
                diabled={cargando}
              >
                {cargando ? "Ingresando..." : "Iniciar Sesión"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
