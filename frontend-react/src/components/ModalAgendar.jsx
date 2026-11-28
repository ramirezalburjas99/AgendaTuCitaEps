import { useEffect, useState } from "react";
import { agendarCita } from "../services/api.js";
import {
  aFechaHoraIso,
  aMinutos,
  fechaLarga,
  formatoHora12,
} from "../utils/fechas.js";

/**
 * Ventana de confirmación para agendar una cita.
 * Muestra el resumen del horario elegido, pide el motivo (opcional) y al confirmar
 * llama a POST /api/citas. Si el backend responde un error (por ejemplo 409 porque
 * alguien tomó ese horario antes), se muestra dentro de la misma ventana.
 *
 * Props:
 *  - doctor      médico elegido (objeto de GET /api/doctores)
 *  - fecha       "2026-11-26"
 *  - hora        "09:30"
 *  - paciente    paciente en sesión (de AuthContext)
 *  - onCerrar    función() para cerrar sin agendar
 *  - onAgendada  función(cita) que se llama cuando el backend confirmó la cita
 */
export default function ModalAgendar({
  doctor,
  fecha,
  hora,
  paciente,
  onCerrar,
  onAgendada,
}) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Cerrar con la tecla Escape (salvo mientras se está enviando)
  useEffect(() => {
    const alPresionar = (e) => {
      if (e.key === "Escape" && !enviando) onCerrar();
    };
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [enviando, onCerrar]);

  // Al presionar "Confirmar cita"
  const confirmar = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const cita = await agendarCita({
        idDoctor: doctor.idDoctor,
        idPaciente: paciente.idPaciente, // el paciente sale de la sesión, no se escribe a mano
        fechaHora: aFechaHoraIso(fecha, hora),
        motivo: motivo.trim() || null, // el motivo es opcional
      });
      onAgendada(cita);
    } catch (err) {
      setError(err.message); // ej: "Este horario ya fue reservado..."
      setEnviando(false);
    }
  };

  // "2026-11-26" -> Date (se arma con partes para evitar desfases de zona horaria)
  const [a, m, d] = fecha.split("-").map(Number);
  const fechaTexto = fechaLarga(new Date(a, m - 1, d));

  return (
    // Fondo oscuro: al hacer clic fuera de la ventana se cierra
    <div className="modal-fondo" onClick={() => !enviando && onCerrar()}>
      {/* stopPropagation: un clic DENTRO de la ventana no debe cerrarla */}
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-titulo" className="modal-titulo">
          Confirmar cita
        </h2>

        <dl className="modal-resumen">
          <div>
            <dt>Médico</dt>
            <dd>{doctor.nombreCompleto}</dd>
          </div>
          <div>
            <dt>Especialidad</dt>
            <dd>
              {doctor.especialidad} · {doctor.consultorio}
            </dd>
          </div>
          <div>
            <dt>Fecha</dt>
            <dd className="modal-capitalizar">{fechaTexto}</dd>
          </div>
          <div>
            <dt>Hora</dt>
            <dd>{formatoHora12(aMinutos(hora))} (30 min)</dd>
          </div>
        </dl>

        <form onSubmit={confirmar}>
          <label className="modal-etiqueta" htmlFor="motivo">
            Motivo de la consulta <span>(opcional)</span>
          </label>
          <textarea
            id="motivo"
            className="modal-motivo"
            rows={3}
            maxLength={255} // el backend guarda máximo 255 caracteres
            placeholder="Ej: dolor de rodilla desde hace dos semanas"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            autoFocus
          />

          {error && (
            <p className="modal-error" role="alert">
              {error}
            </p>
          )}

          <div className="modal-botones">
            <button
              type="button"
              className="btn-secundario"
              onClick={onCerrar}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-agendar" disabled={enviando}>
              {enviando ? "Agendando..." : "Confirmar cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
