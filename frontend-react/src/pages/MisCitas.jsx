import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import usePageStyles from "../hooks/usePageStyles.js";
import { useAuth } from "../context/AuthContext.jsx";
import { cancelarCita, obtenerCitasPaciente } from "../services/api.js";
import { MESES, desdeIso, fechaLarga, horaDeDate } from "../utils/fechas.js";
import BarraSuperior from "../components/BarraSuperior.jsx";

/**
 * Pantalla "Mis citas": las citas agendadas por el paciente en sesión.
 * Datos: GET /api/citas/paciente/{id}.  Cancelar: PATCH /api/citas/{id}/cancelar.
 *
 * Se divide en dos pestañas:
 *  - Próximas:  citas CONFIRMADAS cuya fecha todavía no ha pasado.
 *  - Historial: citas canceladas o que ya ocurrieron.
 */
export default function MisCitas() {
  const estilosListos = usePageStyles([
    "layout.css",
    "agenda.css",
    "misCitas.css",
  ]);
  const { paciente } = useAuth();

  // ---------- Estado ----------
  // Última respuesta del backend. "clave" dice a qué petición corresponde.
  const [datos, setDatos] = useState({ clave: null, citas: [], error: "" });
  const [recarga, setRecarga] = useState(0); // sube para volver a pedir la lista
  const [pestana, setPestana] = useState("proximas"); // "proximas" | "historial"
  const [confirmando, setConfirmando] = useState(null); // id de la cita que pide "¿seguro?"
  const [cancelando, setCancelando] = useState(null); // id de la cita que se está cancelando
  const [errorCancelar, setErrorCancelar] = useState("");

  const claveActual = `${paciente.idPaciente}|${recarga}`;

  // ---------- Cargar las citas del paciente ----------
  useEffect(() => {
    let activo = true;
    obtenerCitasPaciente(paciente.idPaciente)
      .then((citas) => {
        if (activo) setDatos({ clave: claveActual, citas, error: "" });
      })
      .catch((err) => {
        if (activo)
          setDatos({ clave: claveActual, citas: [], error: err.message });
      });
    return () => {
      activo = false;
    };
  }, [paciente.idPaciente, claveActual]);

  const cargando = datos.clave !== claveActual;

  // ---------- Separar en próximas e historial ----------
  const ahora = new Date();
  const esProxima = (c) =>
    c.estado === "CONFIRMADA" && desdeIso(c.fechaHora) >= ahora;

  // Próximas: la más cercana primero. Historial: ya viene de más reciente a más antigua.
  const proximas = datos.citas
    .filter(esProxima)
    .sort((a, b) => desdeIso(a.fechaHora) - desdeIso(b.fechaHora));
  const historial = datos.citas.filter((c) => !esProxima(c));
  const visibles = pestana === "proximas" ? proximas : historial;

  // ---------- Cancelar una cita ----------
  const cancelar = async (idCita) => {
    setErrorCancelar("");
    setCancelando(idCita);
    try {
      await cancelarCita(idCita);
      setConfirmando(null);
      setRecarga(recarga + 1); // vuelve a pedir la lista ya actualizada
    } catch (err) {
      setErrorCancelar(err.message);
    } finally {
      setCancelando(null);
    }
  };

  // Hasta que los CSS estén aplicados no se dibuja nada (evita el parpadeo)
  if (!estilosListos) return null;

  return (
    <>
      <BarraSuperior />
      <main className="contenido-principal mis-citas">
        <div className="contenido-encabezado">
          <div>
            <h1 className="contenido-titulo">Mis citas</h1>
            <p className="contenido-descripcion">
              Consulta y administra las citas que has agendado
            </p>
          </div>
          {/* Link con la apariencia del botón "Agendar cita" de la pantalla Agenda */}
          <Link to="/home" className="btn-agendar">
            + Agendar cita
          </Link>
        </div>

        {/* Pestañas */}
        <div className="citas-pestanas" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={pestana === "proximas"}
            className={pestana === "proximas" ? "activa" : ""}
            onClick={() => setPestana("proximas")}
          >
            Próximas <span>{proximas.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pestana === "historial"}
            className={pestana === "historial" ? "activa" : ""}
            onClick={() => setPestana("historial")}
          >
            Historial <span>{historial.length}</span>
          </button>
        </div>

        {errorCancelar && (
          <p className="modal-error" role="alert">
            {errorCancelar}
          </p>
        )}

        {/* Estados de la lista: cargando, error, vacío o con citas */}
        {cargando && <p className="citas-vacio">Cargando tus citas…</p>}

        {!cargando && datos.error && (
          <div className="citas-vacio">
            <p>{datos.error}</p>
            <button
              type="button"
              className="btn-secundario"
              onClick={() => setRecarga(recarga + 1)}
            >
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !datos.error && visibles.length === 0 && (
          <div className="citas-vacio">
            <p>
              {pestana === "proximas"
                ? "No tienes citas próximas."
                : "Aún no tienes citas en tu historial."}
            </p>
            {pestana === "proximas" && (
              <Link to="/home" className="btn-agendar">
                Agendar mi primera cita
              </Link>
            )}
          </div>
        )}

        {!cargando && !datos.error && (
          <ul className="citas-lista">
            {visibles.map((c) => {
              const fecha = desdeIso(c.fechaHora);
              const cancelada = c.estado === "CANCELADA";
              // Etiqueta del estado: CANCELADA, FINALIZADA (ya pasó) o CONFIRMADA
              const etiqueta = cancelada
                ? "Cancelada"
                : esProxima(c)
                  ? "Confirmada"
                  : "Finalizada";
              return (
                <li className="cita-tarjeta" key={c.idCita}>
                  {/* Bloque con el día y el mes */}
                  <div className="cita-fecha">
                    <strong>{fecha.getDate()}</strong>
                    <span>{MESES[fecha.getMonth()].slice(0, 3)}</span>
                  </div>

                  <div className="cita-detalle">
                    <h3>{c.doctor.nombreCompleto}</h3>
                    <p className="cita-cuando">
                      {fechaLarga(fecha)} · {horaDeDate(fecha)}
                    </p>
                    <p>
                      {c.doctor.especialidad} · {c.doctor.consultorio}
                    </p>
                    {c.sede?.direccionSede && (
                      <p>Sede: {c.sede.direccionSede}</p>
                    )}
                    {c.motivo && (
                      <p className="cita-motivo">Motivo: {c.motivo}</p>
                    )}
                  </div>

                  <div className="cita-acciones">
                    <span
                      className={`cita-estado cita-estado-${etiqueta.toLowerCase()}`}
                    >
                      {etiqueta}
                    </span>

                    {/* Solo las próximas se pueden cancelar, con confirmación en dos pasos */}
                    {esProxima(c) &&
                      (confirmando === c.idCita ? (
                        <div className="cita-confirmar">
                          <span>¿Cancelar esta cita?</span>
                          <button
                            type="button"
                            className="cita-btn-peligro"
                            disabled={cancelando === c.idCita}
                            onClick={() => cancelar(c.idCita)}
                          >
                            {cancelando === c.idCita
                              ? "Cancelando…"
                              : "Sí, cancelar"}
                          </button>
                          <button
                            type="button"
                            className="btn-secundario"
                            disabled={cancelando === c.idCita}
                            onClick={() => setConfirmando(null)}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="cita-btn-cancelar"
                          onClick={() => {
                            setErrorCancelar("");
                            setConfirmando(c.idCita);
                          }}
                        >
                          Cancelar cita
                        </button>
                      ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
