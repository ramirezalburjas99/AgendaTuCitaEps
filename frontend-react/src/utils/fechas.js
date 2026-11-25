// ============================================================
//  Utilidades de fecha y hora compartidas por todas las pantallas.
//  (Antes vivían dentro de Calendario.jsx; se sacaron aquí para poder
//   reutilizarlas en el modal de "Agendar cita" y en "Mis citas".)
// ============================================================

export const DIAS = ["LUN", "MAR", "MIÉ", "JUE", "VIE"];

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Devuelve el lunes de la semana de la fecha dada
export function lunesDe(fecha) {
  const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const dia = d.getDay(); // 0 = domingo ... 6 = sábado
  d.setDate(d.getDate() + (dia === 0 ? -6 : 1 - dia));
  return d;
}

// Devuelve una fecha nueva sumando (o restando) n días
export function sumarDias(fecha, n) {
  const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  d.setDate(d.getDate() + n);
  return d;
}

// Convierte una fecha a texto "2026-11-21". Es el formato que entiende el backend
// y también sirve como identificador de un día.
export function aClave(fecha) {
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${m}-${d}`;
}

// 570 minutos -> "09:30"
export function aHora(minutos) {
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
}

// "09:30" -> 570
export function aMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

// 570 minutos -> "9:30 a. m."
export function formatoHora12(minutos) {
  const h24 = Math.floor(minutos / 60);
  const m = String(minutos % 60).padStart(2, "0");
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m} ${h24 >= 12 ? "p. m." : "a. m."}`;
}

// Número de semana del año (estándar ISO)
export function semanaISO(fecha) {
  const d = new Date(
    Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const inicioAnio = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - inicioAnio) / 86400000 + 1) / 7);
}

// ---------- Utilidades para trabajar con las fechas que manda el backend ----------

// "2026-11-26" + "09:30" -> "2026-11-26T09:30:00" (formato que espera POST /api/citas)
export function aFechaHoraIso(fecha, hora) {
  return `${fecha}T${hora}:00`;
}

// "2026-11-26T09:30:00" -> objeto Date (hora local, sin conversión de zona horaria)
export function desdeIso(iso) {
  return new Date(iso);
}

// "2026-11-26" + "09:30" -> true si ese momento ya pasó
export function yaPaso(fecha, hora) {
  return new Date(aFechaHoraIso(fecha, hora)) < new Date();
}

// Date -> "jueves, 26 de noviembre de 2026"
export function fechaLarga(fecha) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);
}

// Date -> "9:30 a. m."
export function horaDeDate(fecha) {
  return formatoHora12(fecha.getHours() * 60 + fecha.getMinutes());
}
