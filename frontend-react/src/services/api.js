//Dirección del backend. Se lee del archivo .env; si no existe, usa localhost:8080.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

// Función genérica que hace cualquier petición al backend y maneja errores.
// "ruta" es, por ejemplo, '/api/auth/login'. "opciones" son el método (POST) Y EL CUERPO.

async function peticion(ruta, opciones = {}) {
  let respuesta;
  try {
    // fetch es una función del navegador para llamar a una URL.
    // Content-Type le avisa al backend que enviamos JSON.
    respuesta = await fetch(`${API_URL}${ruta}`, {
      headers: { "Content-Type": "application/json" },
      ...opciones,
    });
  } catch {
    // fetch solo falla aqui cuando NO logra conectarse (backend apagado o CORS mal configurado)
    throw new Error(
      "No se pudo conectar con el servidor. ¿Está encendido el backend?",
    );
  }
  // Convertimos la respuesta a objeto. Si no trae cuerpo, queda null.
  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    /* respuesta sin cuerpo */
  }

  // Los códigos 401, 409, 400 ... significan "algo salió mal".
  // Mostramos el "mensaje" que envia tu AuthController.
  if (!respuesta.ok) {
    throw new Error(
      datos?.mensaje ||
        "Ocurrió un error. Revisa los datos e intenta de nuevo.",
    );
  }
  return datos;
}
//POST /api/auth/login ..... devuelve {idPaciente, nombreCompleto, correo}
export const iniciarSesion = (correo, contrasena) =>
  peticion("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ correo, contrasena }), // convierte el objeto a texto JSON
  });
//POST /api/auth/registro .... guarda el paciente
export const registrarPaciente = (paciente) =>
  peticion("/api/auth/registro", {
    method: "POST",
    body: JSON.stringify(paciente),
  });

// DOCTORES

// GET /api/doctores ..... lista de médicos [{idDoctor, nombreCompleto, especialidad, consultorio, sede}]
export const obtenerDoctores = () => peticion("/api/doctores");

// GET /api/doctores/{id}/disponibilidad?fecha=2026-11-26
// Devuelve los horarios (30 min) de ese médico en un día: [{hora, disponible, fechaHoraIso, ...}]
export const obtenerDisponibilidadDoctor = (idDoctor, fecha) =>
  peticion(`/api/doctores/${idDoctor}/disponibilidad?fecha=${fecha}`);

//CITAS

// GET /api/citas/agenda-semanal?lunes=2026-11-23&doctorId=1
// Devuelve las casillas de lunes a viernes de UN médico (disponibles y ocupadas).
export const obtenerAgendaSemanal = (lunes, idDoctor) =>
  peticion(`/api/citas/agenda-semanal?lunes=${lunes}&doctorId=${idDoctor}`);

// POST /api/citas ..... agenda una cita. "datos" = {idDoctor, idPaciente, fechaHora, motivo}
// Si el horario ya fue tomado, el backend responde 409 y peticion() lanza ese mensaje.
export const agendarCita = (datos) =>
  peticion("/api/citas", {
    method: "POST",
    body: JSON.stringify(datos),
  });

// GET /api/citas/paciente/{id} ..... todas las citas del paciente (más reciente primero)
export const obtenerCitasPaciente = (idPaciente) =>
  peticion(`/api/citas/paciente/${idPaciente}`);

// PATCH /api/citas/{id}/cancelar ..... cambia el estado a CANCELADA y libera el horario
export const cancelarCita = (idCita) =>
  peticion(`/api/citas/${idCita}/cancelar`, { method: "PATCH" });
