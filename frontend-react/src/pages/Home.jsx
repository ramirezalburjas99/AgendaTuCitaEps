import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import usePageStyles from "../hooks/usePageStyles.js";
import { useAuth } from "../context/AuthContext.jsx";
import { obtenerDoctores } from "../services/api.js";
import { aClave, lunesDe } from "../utils/fechas.js";
import BarraSuperior from "../components/BarraSuperior.jsx";
import BarraLateral from "../components/BarraLateral.jsx";
import Medicos from "../components/Medicos.jsx";
import Calendario from "../components/Calendario.jsx";
import ModalAgendar from "../components/ModalAgendar.jsx";

/**
 * Pantalla principal (Agenda).
 * Home es el "cerebro" de la pantalla: guarda el estado que comparten la lista de
 * médicos y el calendario (qué médico se ve, qué semana y qué horario está marcado)
 * y se los reparte a cada componente por props.
 */
export default function Home() {
  // CSS de esta pantalla. Devuelve true cuando ya terminó de cargar.
  const estilosListos = usePageStyles([
    "calendario.css",
    "layout.css",
    "filtroDoctores.css",
    "agenda.css",
  ]);

  const { paciente } = useAuth(); // paciente en sesión: {idPaciente, nombreCompleto, correo}

  // ---------- Estado de la pantalla ----------

  // Lista de médicos que devuelve GET /api/doctores
  const [medicos, setMedicos] = useState({
    cargando: true,
    error: "",
    lista: [],
  });
  // Médico elegido por el usuario. null = todavía no eligió: se usa el primero de la lista.
  const [doctorElegido, setDoctorElegido] = useState(null);
  // Lunes de la semana que muestra el calendario (empieza en la semana actual)
  const [lunes, setLunes] = useState(() => lunesDe(new Date()));
  // Horario marcado en el calendario, con formato "2026-11-26|09:30" (null = ninguno)
  const [seleccion, setSeleccion] = useState(null);
  // Contador que sube para obligar a Calendario y Medicos a volver a pedir sus datos
  const [recarga, setRecarga] = useState(0);
  // ¿Está abierta la ventana de confirmación de "Agendar cita"?
  const [modalAbierto, setModalAbierto] = useState(false);
  // Mensaje temporal sobre el calendario: { tipo: "exito" | "info", texto } (null = ninguno)
  const [aviso, setAviso] = useState(null);

  // ---------- Cargar los médicos al entrar ----------
  useEffect(() => {
    let activo = true;
    obtenerDoctores()
      .then((lista) => {
        if (activo) setMedicos({ cargando: false, error: "", lista });
      })
      .catch((err) => {
        if (activo)
          setMedicos({ cargando: false, error: err.message, lista: [] });
      });
    return () => {
      activo = false;
    };
  }, []);

  // El aviso desaparece solo a los 6 segundos
  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(null), 6000);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  // Médico cuya agenda se está viendo
  const doctorId = doctorElegido ?? medicos.lista[0]?.idDoctor ?? null;
  const doctor = medicos.lista.find((m) => m.idDoctor === doctorId);

  // ---------- Acciones ----------

  // Se marcó un médico en la lista: cambia la agenda y se limpia el horario marcado
  const elegirDoctor = (idDoctor) => {
    setDoctorElegido(idDoctor);
    setSeleccion(null);
  };

  // Se pulsó una hora de HOY en la tarjeta de un médico: se muestra su agenda
  // de esta semana y se deja marcado ese horario.
  const elegirHora = (doctor, hora) => {
    setDoctorElegido(doctor.idDoctor);
    setLunes(lunesDe(new Date()));
    setSeleccion(`${aClave(new Date())}|${hora}`);
  };

  // Botón "Agendar cita": si hay un horario marcado abre la confirmación;
  // si no, le explica al usuario qué debe hacer primero.
  const abrirAgendar = () => {
    if (!seleccion || !doctor) {
      setAviso({
        tipo: "info",
        texto: "Primero selecciona un horario disponible en el calendario.",
      });
      return;
    }
    setAviso(null);
    setModalAbierto(true);
  };

  // El backend confirmó la cita: se cierra la ventana, se limpia la selección,
  // se refrescan calendario y horarios de hoy, y se avisa al usuario.
  const citaAgendada = () => {
    setModalAbierto(false);
    setSeleccion(null);
    setRecarga(recarga + 1);
    setAviso({ tipo: "exito", texto: "¡Tu cita quedó agendada!" });
  };

  // Hasta que los CSS estén aplicados no se dibuja nada (evita el parpadeo del logo).
  // Va DESPUÉS de todos los hooks, porque React exige llamarlos siempre en el mismo orden.
  if (!estilosListos) return null;

  return (
    <>
      <BarraSuperior />
      <div className="contenedor-pagina">
        <BarraLateral />
        <main className="contenido-principal">
          {/* Encabezado: título a la izquierda y botón "Agendar cita" a la derecha,
              donde termina el calendario */}
          <div className="contenido-encabezado">
            <div>
              <h1 className="contenido-titulo">Agenda</h1>
              <p className="contenido-descripcion">
                agenda las citas que necesites con el especialista que deseas
              </p>
            </div>
            <button
              type="button"
              className="btn-agendar"
              onClick={abrirAgendar}
            >
              + Agendar cita
            </button>
          </div>

          {/* Mensaje de éxito o ayuda (role="status": los lectores de pantalla lo anuncian) */}
          {aviso && (
            <div className={`aviso aviso-${aviso.tipo}`} role="status">
              <span>{aviso.texto}</span>
              {aviso.tipo === "exito" && (
                <Link to="/mis-citas">Ver mis citas</Link>
              )}
            </div>
          )}

          <div className="agenda-body">
            <Medicos
              doctores={medicos.lista}
              cargando={medicos.cargando}
              error={medicos.error}
              doctorId={doctorId}
              onElegirDoctor={elegirDoctor}
              onElegirHora={elegirHora}
              recarga={recarga}
            />
            {/* El id "contenedor-calendario" es necesario: calendario.css limita sus estilos a él */}
            <div id="contenedor-calendario">
              <Calendario
                doctorId={doctorId}
                lunes={lunes}
                onCambiarLunes={setLunes}
                seleccion={seleccion}
                onSeleccionar={setSeleccion}
                pacienteId={paciente.idPaciente}
                recarga={recarga}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Ventana de confirmación: solo existe mientras está abierta */}
      {modalAbierto && (
        <ModalAgendar
          doctor={doctor}
          fecha={seleccion.split("|")[0]}
          hora={seleccion.split("|")[1]}
          paciente={paciente}
          onCerrar={() => setModalAbierto(false)}
          onAgendada={citaAgendada}
        />
      )}
    </>
  );
}
