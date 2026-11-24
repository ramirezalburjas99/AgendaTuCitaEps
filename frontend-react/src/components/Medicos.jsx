// DATOS DE DEMOSTRACIÓN. Cuando conecte la base de datos, debo modificar este arreglo
// por una llamada al backend (GET /API/DOCTORES)

const MEDICOS = [
  {
    nombre: "Dra. Ana Martínez",
    detalle: "Rodilla y cadera",
    consultorio: "Consultorio 204 · Traumatología",
    desde: "10:00",
    horas: ["10:00", "11:30", "14:00"],
  },
  {
    nombre: "Dr. Carlos Ruiz",
    detalle: "Hombro y codo",
    consultorio: "Consultorio 206 · Traumatología",
    desde: "10:30",
    horas: ["10:30", "12:00", "15:00"],
  },
  {
    nombre: "Dra. Lucía Torres",
    detalle: "Pie y tobillo",
    consultorio: "Consultorio 208 · Traumatología",
    desde: "11:00",
    horas: ["11:00", "12:30", "14:30"],
  },
];

export default function Medicos() {
  const total = MEDICOS.length; // en vez de escribir "3" a mano

  return (
    <section className="medicos">
      <header className="medicos-cabecera">
        <h2 className="medicos-titulo">
          Médicos disponibles <span className="medicos-contador">{total}</span>
        </h2>
        <p className="medicos-subtitulo">seleccionados</p>
      </header>

      <input
        type="search"
        className="medicos-buscar"
        placeholder="Buscar por nombre"
      />

      <label className="medicos-todos" htmlFor="med-todos">
        <input type="checkbox" id="med-todos" defaultChecked />
        <span className="medicos-todos-texto">Seleccionar todos</span>
        <span className="medicos-todos-cuenta">
          {total} de {total}
        </span>
      </label>

      {/* Se dibuja UNA tarjeta por cada médico del arreglo (antes había 3 bloques copiados) */}
      {MEDICOS.map((m) => (
        <article className="medico-card" key={m.nombre}>
          <div className="medico-fila">
            {/* Tu proyecto solo tiene doctora.jpeg; carlos.jpg y lucia.jpg no estaban en /static/img */}
            <img
              className="medico-foto"
              src="/img/doctora.jpeg"
              alt={m.nombre}
            />
            <div className="medico-datos">
              <strong>{m.nombre}</strong>
              <small>{m.detalle}</small>
            </div>
            <input
              type="checkbox"
              className="medico-check"
              defaultChecked
              aria-label={`Seleccionar ${m.nombre}`}
            />
          </div>
          <p className="medico-consultorio">{m.consultorio}</p>
          <p className="medico-disponible">
            Disponible hoy desde las {m.desde}
          </p>
          <div className="medico-horas">
            {m.horas.map((h) => (
              <button type="button" key={h}>
                {h}
              </button>
            ))}
          </div>
        </article>
      ))}

      <p className="medicos-nota">
        Los horarios corresponden a hoy. Cada control dura 30 minutos.
      </p>
    </section>
  );
}
