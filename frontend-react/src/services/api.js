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
  peticion("/api(auth/login", {
    method: "POST",
    body: JSON.stringify({ correo, contrasena }), // convierte el objeto a texto JSON
  });
//POST /api/auth/registro .... guarda el paciente
export const registrarPaciente = (paciente) =>
  peticion("/api/auth/registro", {
    method: "POST",
    body: JSON.stringify(paciente),
  });
