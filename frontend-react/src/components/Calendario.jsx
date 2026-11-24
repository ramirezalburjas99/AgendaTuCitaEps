import { useState } from "react";

const DIAS = ["LUN", "MAR", "MIÉ", "JUE", "VIE"];
const MESES = [
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

// Horario de la agenda, en minutos desde las 00:00 (9:00 a. m. = 540 min)
const INICIO = 9 * 60;
const FIN = 16 * 60 + 30;
const PASO = 30; // cada casilla dura 30 minutos
const FILA_PX = 40; // alto de cada fila en píxeles

// ---------- Utilidades de fecha (las mismas del calendario.js) ----------

// Devuelve el lunes de la semana de la fecha dada
function lunesDe(fecha) {
  const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const dia = d.getDay(); // 0 = domingo ... 6 = sábado
  d.setDate(d.getDate() + (dia === 0 ? -6 : 1 - dia));
  return d;
}

// Devuelve una fecha nueva sumando (o restando) n días
function sumarDias(fecha, n) {
  const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  d.setDate(d.getDate() + n);
  return d;
}

// Convierte una fecha a texto "2026-11-21". Sirve como identificador de un día.
function aClave(fecha) {
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${m}-${d}`;
}

// 570 minutos -> "09:30"
function aHora(minutos) {
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
}

// "09:30" -> 570
function aMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

// 570 minutos -> "9:30 a. m."
function formatoHora12(minutos) {
  const h24 = Math.floor(minutos / 60);
  const m = String(minutos % 60).padStart(2, "0");
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m} ${h24 >= 12 ? "p. m." : "a. m."}`;
}

// Número de semana del año (estándar ISO)
function semanaISO(fecha) {
  const d = new Date(
    Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const inicioAnio = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - inicioAnio) / 86400000 + 1) / 7);
}

// ---------- Datos de demostración ----------
// "dia": 0 = lunes ... 4 = viernes. Luego se reemplazan por GET /api/citas.
const eventosDemo = [
  {
    tipo: "cita",
    dia: 0,
    hora: "09:00",
    paciente: "Elena García",
    doctor: "A. Martínez",
  },
  {
    tipo: "cita",
    dia: 0,
    hora: "09:30",
    paciente: "Jorge Mendoza",
    doctor: "C. Ruiz",
  },
  { tipo: "disponible", dia: 0, hora: "10:00", doctor: "A. Martínez" },
  { tipo: "disponible", dia: 0, hora: "10:30", doctor: "C. Ruiz" },
  { tipo: "disponible", dia: 0, hora: "11:00", doctor: "L. Torres" },
  { tipo: "disponible", dia: 0, hora: "11:30", doctor: "A. Martínez" },
  { tipo: "disponible", dia: 0, hora: "14:00", doctor: "A. Martínez" },
  { tipo: "disponible", dia: 0, hora: "14:30", doctor: "L. Torres" },
  { tipo: "disponible", dia: 0, hora: "15:00", doctor: "C. Ruiz" },
  {
    tipo: "cita",
    dia: 1,
    hora: "09:00",
    paciente: "Pablo Sánchez",
    doctor: "C. Ruiz",
  },
  { tipo: "disponible", dia: 1, hora: "10:00", doctor: "A. Martínez" },
  {
    tipo: "cita",
    dia: 1,
    hora: "11:00",
    paciente: "Sofía Herrera",
    doctor: "L. Torres",
  },
  {
    tipo: "cita",
    dia: 1,
    hora: "14:00",
    paciente: "Diego Morales",
    doctor: "A. Martínez",
  },
  { tipo: "disponible", dia: 1, hora: "15:30", doctor: "L. Torres" },
  {
    tipo: "cita",
    dia: 2,
    hora: "09:30",
    paciente: "Valeria López",
    doctor: "A. Martínez",
  },
  { tipo: "disponible", dia: 2, hora: "10:30", doctor: "L. Torres" },
  { tipo: "disponible", dia: 2, hora: "14:00", doctor: "A. Martínez" },
  {
    tipo: "cita",
    dia: 2,
    hora: "15:00",
    paciente: "Marta Fernández",
    doctor: "L. Torres",
  },
  {
    tipo: "cita",
    dia: 4,
    hora: "09:30",
    paciente: "Camila Flores",
    doctor: "A. Martínez",
  },
  { tipo: "disponible", dia: 4, hora: "11:00", doctor: "C. Ruiz" },
  { tipo: "disponible", dia: 4, hora: "14:30", doctor: "A. Martínez" },
  {
    tipo: "cita",
    dia: 4,
    hora: "16:00",
    paciente: "Luis Vega",
    doctor: "C. Ruiz",
  },
];

// Crea un índice para buscar rápido: "2026-11-23|09:00" -> evento de ese día y hora.
// Los eventos de demo se ubican en la semana actual.
function construirIndice() {
  const lunes = lunesDe(new Date());
  const indice = new Map();
  for (const ev of eventosDemo) {
    const fecha = aClave(sumarDias(lunes, ev.dia));
    indice.set(`${fecha}|${ev.hora}`, { ...ev, fecha });
  }
  return indice;
}

export default function Calendario() {
  // ESTADO 1: lunes de la semana que se está mostrando (empieza en la semana actual)
  const [lunesActual, setLunesActual] = useState(() => lunesDe(new Date()));
  // ESTADO 2: horario marcado por el usuario (null = ninguno)
  const [seleccionado, setSeleccionado] = useState(null);
  // Los eventos se calculan una sola vez
  const [indiceEventos] = useState(construirIndice);

  const viernes = sumarDias(lunesActual, 4);
  const claveHoy = aClave(new Date());
  const totalFilas = (FIN - INICIO) / PASO;

  // Flechas de semana: dir = -1 (anterior) o 1 (siguiente)
  const cambiarSemana = (dir) => {
    setLunesActual(sumarDias(lunesActual, dir * 7));
    setSeleccionado(null); // al cambiar de semana se quita la selección
  };
  // Botón "Hoy": vuelve a la semana actual
  const irAHoy = () => {
    setLunesActual(lunesDe(new Date()));
    setSeleccionado(null);
  };
  // Clic en un horario: lo marca; si ya estaba marcado, lo desmarca
  const seleccionar = (clave) =>
    setSeleccionado(seleccionado === clave ? null : clave);

  // Texto del pie del calendario
  const mensaje = () => {
    if (!seleccionado)
      return "Selecciona un horario disponible para agendar tu cita.";
    const [fecha, hora] = seleccionado.split("|");
    const ev = indiceEventos.get(seleccionado);
    const [, mes, dia] = fecha.split("-");
    return `Seleccionado: ${Number(dia)}/${mes} a las ${hora} con ${ev.doctor}`;
  };

  // Dibuja el contenido de una casilla: una cita (no se puede tocar) o un horario libre (botón)
  const renderEvento = (ev, clave) => {
    if (ev.tipo === "cita") {
      return (
        <div className="cal-evento cal-cita">
          <span className="cal-evento-principal">{ev.paciente}</span>
          <span className="cal-evento-detalle">
            {formatoHora12(aMinutos(ev.hora))} · {ev.doctor}
          </span>
        </div>
      );
    }
    return (
      <button
        type="button"
        // si es el horario marcado, se le agrega la clase "seleccionado"
        className={`cal-evento cal-disponible${clave === seleccionado ? " seleccionado" : ""}`}
        onClick={() => seleccionar(clave)}
      >
        <span className="cal-evento-principal">
          {formatoHora12(aMinutos(ev.hora))} · Disponible
        </span>
        <span className="cal-evento-detalle">{ev.doctor}</span>
      </button>
    );
  };

  // La cuadrícula se arma como una lista de celdas; cada una indica su fila y columna.
  const celdas = [];

  // Esquina superior izquierda
  celdas.push(
    <div
      key="esquina"
      className="cal-esquina"
      style={{ gridRow: 1, gridColumn: 1 }}
    >
      GMT-5
    </div>,
  );

  // Fila 1: encabezados de los 5 días (columnas 2 a 6)
  DIAS.forEach((nombre, i) => {
    const fecha = sumarDias(lunesActual, i);
    const esHoy = aClave(fecha) === claveHoy;
    celdas.push(
      <div
        key={`dia-${i}`}
        className={`cal-dia${esHoy ? " hoy" : ""}`}
        style={{ gridRow: 1, gridColumn: i + 2 }}
      >
        <span className="cal-dia-nombre">
          {nombre + (esHoy ? " · HOY" : "")}
        </span>
        <span className="cal-dia-numero">{fecha.getDate()}</span>
      </div>,
    );
  });

  // Filas siguientes: una por cada franja de 30 minutos
  for (let f = 0; f < totalFilas; f++) {
    const minutos = INICIO + f * PASO;
    const fila = f + 2; // la fila 1 son los encabezados

    // Columna 1: la hora (solo se escribe en las horas en punto)
    celdas.push(
      <div
        key={`hora-${f}`}
        className="cal-hora"
        style={{ gridRow: fila, gridColumn: 1 }}
      >
        {minutos % 60 === 0 ? aHora(minutos) : ""}
      </div>,
    );

    // Columnas 2 a 6: una celda por día; si hay un evento a esa hora, se dibuja adentro
    for (let d = 0; d < DIAS.length; d++) {
      const clave = `${aClave(sumarDias(lunesActual, d))}|${aHora(minutos)}`;
      const ev = indiceEventos.get(clave);
      celdas.push(
        <div
          key={`c-${f}-${d}`}
          className="cal-celda"
          style={{ gridRow: fila, gridColumn: d + 2 }}
        >
          {ev && renderEvento(ev, clave)}
        </div>,
      );
    }
  }

  return (
    <div className="cal-tarjeta">
      <div className="cal-cabecera">
        <div className="cal-barra">
          <div className="cal-barra-izq">
            <h3 className="cal-titulo">
              {MESES[lunesActual.getMonth()]} {lunesActual.getFullYear()}
            </h3>
            <button
              type="button"
              className="cal-icono"
              aria-label="Semana anterior"
              onClick={() => cambiarSemana(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="cal-icono"
              aria-label="Semana siguiente"
              onClick={() => cambiarSemana(1)}
            >
              ›
            </button>
            <button type="button" className="cal-hoy" onClick={irAHoy}>
              Hoy
            </button>
          </div>
          <div className="cal-vistas">
            {/* Día y Mes están desactivados: eran "próximamente" en tu versión original */}
            <button
              type="button"
              className="cal-vista"
              disabled
              title="Próximamente"
            >
              Día
            </button>
            <button type="button" className="cal-vista activa">
              Semana
            </button>
            <button
              type="button"
              className="cal-vista"
              disabled
              title="Próximamente"
            >
              Mes
            </button>
          </div>
        </div>
        <div className="cal-rango">
          <span>
            {lunesActual.getDate()} – {viernes.getDate()} de{" "}
            {MESES[viernes.getMonth()]} · Semana {semanaISO(lunesActual)}
          </span>
          <span>Controles de {PASO} min</span>
        </div>
      </div>

      {/* gridTemplateRows: una fila de 64px para los días y las demás de FILA_PX */}
      <div
        className="cal-grilla"
        style={{ gridTemplateRows: `64px repeat(${totalFilas}, ${FILA_PX}px)` }}
      >
        {celdas}
      </div>

      <div className="cal-pie">
        <div className="cal-leyenda">
          <span className="cal-leyenda-item">
            <i className="cal-muestra cal-muestra-cita" />
            Cita confirmada
          </span>
          <span className="cal-leyenda-item">
            <i className="cal-muestra cal-muestra-disp" />
            Horario disponible
          </span>
        </div>
        {/* aria-live avisa a los lectores de pantalla cuando el mensaje cambia */}
        <span className="cal-mensaje" aria-live="polite">
          {mensaje()}
        </span>
      </div>
    </div>
  );
}
