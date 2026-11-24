import usePageStyles from "../hooks/usePageStyles.js";
import BarraSuperior from "../components/BarraSuperior.jsx";
import BarraLateral from "../components/BarraLateral.jsx";
import Medicos from "../components/Medicos.jsx";
import Calendario from "../components/Calendario.jsx";

export default function Home() {
  // CSS de esta pantalla (los mismos que cargaba home.html)
  usePageStyles(["calendario.css", "layout.css", "filtroDoctores.css"]);

  return (
    <>
      {/* Cada componente reemplaza un th:replace de Thymeleaf */}
      <BarraSuperior />
      <div className="contenedor-pagina">
        <BarraLateral />
        <main className="contenido-principal">
          <h1 className="contenido-titulo">Agenda</h1>
          <p className="contenido-descripcion">
            agenda las citas que necesites con el especialista que deseas
          </p>
          <div className="agenda-body">
            <Medicos />
            {/* El id "contenedor-calendario" es necesario: calendario.css limita sus estilos a él */}
            <div id="contenedor-calendario">
              <Calendario />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
