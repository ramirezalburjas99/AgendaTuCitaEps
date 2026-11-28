import { useEffect, useState } from "react";
import { obtenerAgendaSemanal } from "../services/api.js";
import {
  DIAS,
  MESES,
  aClave,
  aHora,
  aMinutos,
  formatoHora12,
  lunesDe,
  semanaISO,
  sumarDias,
  yaPaso,
} from "../utils/fechas.js";

// Horario de la agenda, en minutos desde las 00:00 (9:00 a. m. = 540 min).
// Debe coincidir con HORA_INICIO / ULTIMO_TURNO de CitaService.java
const INICIO = 9 * 60;
const FIN = 16 * 60 + 30;
const PASO = 30; // cada casilla dura 30 minutos
const FILA_PX = 40; // alto de cada fila en píxeles

/**
 * Calendario semanal (lunes a viernes) de UN médico.
 * Es un componente "controlado": el estado importante (médico, semana y horario
 * seleccionado) vive en Home.jsx y llega por props. Así otros componentes
 * (la lista de médicos y el botón "Agendar cita") pueden cambiarlo.
 *
 * Props:
 *  - doctorId        id del médico cuya agenda se muestra
 *  - lunes           Date del lunes de la semana visible
 *  - onCambiarLunes  función(Date) para cambiar de semana
 *  - seleccion       horario marcado, con formato "2026-11-26|09:30" (o null)
 *  - onSeleccionar   función(clave | null) para marcar/desmarcar un horario
 *  - pacienteId      id del paciente en sesión (para resaltar SUS citas)
 *  - recarga         número que sube cuando hay que volver a pedir los datos
 */
export default function Calendario({
  doctorId,
  lunes,
  onCambiarLunes,
  seleccion,
  onSeleccionar,
  pacienteId,
  recarga,
}) {
  // Sube cuando el usuario presiona "Reintentar" tras un error de red.
  const [intento, setIntento] = useState(0);

  // Resultado de la última petición. Guarda a qué médico/semana pertenece ("base")
  // y a qué petición exacta respondió ("clave"), para saber si todavía está al día.
  const [resultado, setResultado] = useState({
    base: null,
    clave: null,
    slots: [],
    error: "",
  });

  const lunesTexto = aClave(lunes);
  const base = `${doctorId}|${lunesTexto}`;
  const claveActual = `${base}|${recarga}|${intento}`;

  // ---------- Pedir la agenda al backend ----------
  // GET /api/citas/agenda-semanal?lunes=...&doctorId=...
  useEffect(() => {
    if (doctorId == null) return; // todavía no se sabe qué médico mostrar
    let activo = true; // si el usuario cambia de semana antes de que llegue, se ignora la respuesta

    obtenerAgendaSemanal(lunesTexto, doctorId)
      .then((slots) => {
        if (activo)
          setResultado({ base, clave: claveActual, slots, error: "" });
      })
      .catch((err) => {
        if (activo)
          setResultado({
            base,
            clave: claveActual,
            slots: [],
            error: err.message,
          });
      });

    return () => {
      activo = false;
    };
  }, [doctorId, lunesTexto, base, claveActual]);

  // "cargando" = lo último que llegó no corresponde a lo que se está pidiendo ahora
  const cargando = doctorId != null && resultado.clave !== claveActual;
  // Mientras recarga la misma semana se siguen mostrando los datos anteriores (sin parpadeo)
  const slots = resultado.base === base ? resultado.slots : [];
  const error = resultado.clave === claveActual ? resultado.error : "";

  // Índice para buscar rápido: "2026-11-26|09:00" -> casilla de ese día y hora
  const indice = new Map(slots.map((s) => [`${s.fecha}|${s.hora}`, s]));

  const viernes = sumarDias(lunes, 4);
  const claveHoy = aClave(new Date());
  const totalFilas = (FIN - INICIO) / PASO;

  // ---------- Acciones del usuario ----------

  // Flechas de semana: dir = -1 (anterior) o 1 (siguiente)
  const cambiarSemana = (dir) => {
    onCambiarLunes(sumarDias(lunes, dir * 7));
    onSeleccionar(null); // al cambiar de semana se quita la selección
  };
  // Botón "Hoy": vuelve a la semana actual
  const irAHoy = () => {
    onCambiarLunes(lunesDe(new Date()));
    onSeleccionar(null);
  };
  // Clic en un horario: lo marca; si ya estaba marcado, lo desmarca
  const seleccionar = (clave) =>
    onSeleccionar(seleccion === clave ? null : clave);

  // ---------- Texto del pie del calendario ----------
  const mensaje = () => {
    if (doctorId == null) return "No hay médicos disponibles por ahora.";
    if (error) return error;
    if (cargando) return "Cargando agenda…";
    if (!seleccion)
      return "Selecciona un horario disponible para agendar tu cita.";
    const [fecha, hora] = seleccion.split("|");
    const [, mes, dia] = fecha.split("-");
    const doctor = indice.get(seleccion)?.nombreDoctor ?? "el médico elegido";
    return `Seleccionado: ${Number(dia)}/${mes} a las ${hora} con ${doctor}`;
  };

  // ---------- Dibujo de una casilla ----------
  // Devuelve el contenido de la celda según el tipo de casilla que mandó el backend.
  const renderCasilla = (slot, clave) => {
    // CASILLA OCUPADA: ya existe una cita confirmada en ese horario
    if (slot.tipo === "cita") {
      const esMia = slot.idPaciente === pacienteId;
      return (
        // Las citas de otras personas se muestran como "Reservado" (sin su nombre)
        <div className={`cal-evento cal-cita${esMia ? "" : " cal-reservado"}`}>
          <span className="cal-evento-principal">
            {esMia ? "Tu cita" : "Reservado"}
          </span>
          <span className="cal-evento-detalle">
            {formatoHora12(aMinutos(slot.hora))}
            {esMia ? ` · ${slot.nombreDoctor}` : ""}
          </span>
        </div>
      );
    }

    // CASILLA LIBRE EN EL PASADO: no se puede agendar, se deja vacía
    if (yaPaso(slot.fecha, slot.hora)) return null;

    // CASILLA LIBRE: botón para seleccionarla
    return (
      <button
        type="button"
        // si es el horario marcado, se le agrega la clase "seleccionado"
        className={`cal-evento cal-disponible${clave === seleccion ? " seleccionado" : ""}`}
        onClick={() => seleccionar(clave)}
      >
        <span className="cal-evento-principal">
          {formatoHora12(aMinutos(slot.hora))} · Disponible
        </span>
        <span className="cal-evento-detalle">{slot.nombreDoctor}</span>
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
    const fecha = sumarDias(lunes, i);
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

    // Columnas 2 a 6: una celda por día; si el backend mandó una casilla, se dibuja adentro
    for (let d = 0; d < DIAS.length; d++) {
      const fechaTexto = aClave(sumarDias(lunes, d));
      const hora = aHora(minutos);
      const clave = `${fechaTexto}|${hora}`;
      const slot = indice.get(clave);
      celdas.push(
        <div
          key={`c-${f}-${d}`}
          className={`cal-celda${yaPaso(fechaTexto, hora) ? " cal-celda-pasada" : ""}`}
          style={{ gridRow: fila, gridColumn: d + 2 }}
        >
          {slot && renderCasilla(slot, clave)}
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
              {MESES[lunes.getMonth()]} {lunes.getFullYear()}
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
            {lunes.getDate()} – {viernes.getDate()} de{" "}
            {MESES[viernes.getMonth()]} · Semana {semanaISO(lunes)}
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
            Tu cita
          </span>
          <span className="cal-leyenda-item">
            <i className="cal-muestra cal-muestra-reservado" />
            Reservado
          </span>
          <span className="cal-leyenda-item">
            <i className="cal-muestra cal-muestra-disp" />
            Horario disponible
          </span>
        </div>
        {/* aria-live avisa a los lectores de pantalla cuando el mensaje cambia */}
        <span
          className={`cal-mensaje${error ? " cal-error" : ""}`}
          aria-live="polite"
        >
          {mensaje()}
          {error && (
            <button
              type="button"
              className="cal-reintentar"
              onClick={() => setIntento(intento + 1)}
            >
              Reintentar
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
