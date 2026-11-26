import { useEffect, useState } from "react";
import { obtenerDisponibilidadDoctor } from "../services/api.js";
import { aClave, yaPaso } from "../utils/fechas.js";

/**
 * Columna de "Médicos disponibles".
 * Ya no usa datos de demostración: la lista de médicos llega por props desde
 * Home.jsx (GET /api/doctores) y los horarios de HOY de cada médico se piden aquí
 * (GET /api/doctores/{id}/disponibilidad?fecha=hoy).
 *
 * Props:
 *  - doctores         lista de médicos que devolvió el backend
 *  - cargando / error estado de la carga de la lista de médicos
 *  - doctorId         médico seleccionado (su agenda es la que muestra el calendario)
 *  - onElegirDoctor   función(idDoctor) al marcar un médico
 *  - onElegirHora     función(doctor, "10:30") al pulsar una hora de hoy
 *  - recarga          sube cuando se agenda una cita, para refrescar los horarios de hoy
 */
export default function Medicos({
  doctores,
  cargando,
  error,
  doctorId,
  onElegirDoctor,
  onElegirHora,
  recarga,
}) {
  const [busqueda, setBusqueda] = useState("");

  // Horas libres de hoy por médico: { idDoctor: ["10:00", "10:30", ...] }
  // "clave" indica para qué lista de médicos / recarga se calcularon.
  const [hoy, setHoy] = useState({ clave: null, horas: {} });
  const claveHoy = `${doctores.map((d) => d.idDoctor).join(",")}|${recarga}`;

  useEffect(() => {
    if (doctores.length === 0) return;
    let activo = true;
    const fecha = aClave(new Date());

    // Se pide la disponibilidad de TODOS los médicos al mismo tiempo.
    // allSettled: si uno falla, los demás igual se muestran.
    Promise.allSettled(
      doctores.map((d) => obtenerDisponibilidadDoctor(d.idDoctor, fecha)),
    ).then((respuestas) => {
      if (!activo) return;
      const horas = {};
      respuestas.forEach((r, i) => {
        // Solo horas libres que todavía no pasaron
        horas[doctores[i].idDoctor] =
          r.status === "fulfilled"
            ? r.value
                .filter((s) => s.disponible && !yaPaso(s.fecha, s.hora))
                .map((s) => s.hora)
            : [];
      });
      setHoy({ clave: claveHoy, horas });
    });

    return () => {
      activo = false;
    };
  }, [doctores, claveHoy]);

  const horasListas = hoy.clave === claveHoy;

  // Filtro del buscador (ignora mayúsculas)
  const visibles = doctores.filter((d) =>
    d.nombreCompleto.toLowerCase().includes(busqueda.trim().toLowerCase()),
  );

  return (
    <section className="medicos">
      <header className="medicos-cabecera">
        <h2 className="medicos-titulo">
          Médicos disponibles{" "}
          <span className="medicos-contador">{doctores.length}</span>
        </h2>
        <p className="medicos-subtitulo">Elige un médico para ver su agenda</p>
      </header>

      <input
        type="search"
        className="medicos-buscar"
        placeholder="Buscar por nombre"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargando && <p className="medicos-nota">Cargando médicos…</p>}
      {error && <p className="medicos-nota medicos-error">{error}</p>}
      {!cargando && !error && visibles.length === 0 && (
        <p className="medicos-nota">No se encontraron médicos.</p>
      )}

      {/* Se dibuja UNA tarjeta por cada médico que mandó el backend */}
      {visibles.map((m) => {
        const horas = (hoy.horas[m.idDoctor] ?? []).slice(0, 3); // máx. 3 botones
        const activo = m.idDoctor === doctorId;
        return (
          <article
            className={`medico-card${activo ? " medico-card-activo" : ""}`}
            key={m.idDoctor}
          >
            <div className="medico-fila">
              {/* Solo existe doctora.jpeg en /public/img; todos usan esa foto por ahora */}
              <img
                className="medico-foto"
                src="/img/doctora.jpeg"
                alt={m.nombreCompleto}
              />
              <div className="medico-datos">
                <strong>{m.nombreCompleto}</strong>
                <small>{m.especialidad}</small>
              </div>
              {/* Solo se ve la agenda de un médico a la vez: marcar uno desmarca los demás */}
              <input
                type="checkbox"
                className="medico-check"
                checked={activo}
                onChange={() => onElegirDoctor(m.idDoctor)}
                aria-label={`Ver agenda de ${m.nombreCompleto}`}
              />
            </div>
            <p className="medico-consultorio">
              {m.consultorio} · {m.especialidad}
            </p>

            {!horasListas ? (
              <p className="medico-sin-horas">Consultando horarios…</p>
            ) : horas.length === 0 ? (
              <p className="medico-sin-horas">Sin horarios disponibles hoy</p>
            ) : (
              <>
                <p className="medico-disponible">
                  Disponible hoy desde las {horas[0]}
                </p>
                <div className="medico-horas">
                  {horas.map((h) => (
                    <button
                      type="button"
                      key={h}
                      // Al pulsar una hora se selecciona ese horario en el calendario
                      onClick={() => onElegirHora(m, h)}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </>
            )}
          </article>
        );
      })}

      <p className="medicos-nota">
        Los horarios corresponden a hoy. Cada control dura 30 minutos.
      </p>
    </section>
  );
}
