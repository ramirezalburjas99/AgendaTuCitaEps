//Lista de especialidades. Se dibuja con .map() para no repetir el mismo HTML 4 veces.
// Cada elemento es [valor, texto que se muestra]
const ESPECIALIDADES = [
  ["traumatologia", "Traumatologia"],
  ["cirugia", "Cirugia general"],
  ["cardiologia", "Cardiologia"],
  ["dermatologia", "Dermatologia"],
];

export default function BarraLateral() {
  return (
    <aside className="barra-lateral">
      <h2 className="lateral-titulo">Filtrar agenda</h2>

      <form className="lateral-form">
        <section className="lateral-seccion">
          <h3>Tipo de atención</h3>
          <label className="lateral-opcion" htmlFor="tipo-consulta">
            {/* defaultChecked: viene marcado al inicio pero se puede cambiar */}
            <input
              type="radio"
              id="tipo-consulta"
              name="tipoAtencion"
              value="consulta"
              defaultChecked
            />
            Consulta
          </label>
          <label className="lateral-opcion" htmlFor="tipo-control">
            <input
              type="radio"
              id="tipo-control"
              name="tipoAtencion"
              value="control"
            />
            Control
          </label>
        </section>

        <section className="lateral-seccion">
          <h3>Especialidad</h3>
          {/* PENDIENTE: traer estas especialidades desde la base de datos */}
          {ESPECIALIDADES.map(([valor, texto]) => (
            // "key" le permite a React identificar cada elemento de la lista
            <label
              className="lateral-opcion"
              htmlFor={`esp-${valor}`}
              key={valor}
            >
              <input
                type="checkbox"
                id={`esp-${valor}`}
                name="especialidad"
                value={valor}
              />
              {texto}
            </label>
          ))}
        </section>

        <section className="lateral-seccion">
          <h3>Modalidad</h3>
          <label className="lateral-opcion" htmlFor="mod-presencial">
            <input
              type="radio"
              id="mod-presencial"
              name="modalidad"
              value="presencial"
              defaultChecked
            />
            Presencial
          </label>
          <label className="lateral-opcion" htmlFor="mod-video">
            <input
              type="radio"
              id="mod-video"
              name="modalidad"
              value="videollamada"
            />
            Videollamada
          </label>
        </section>

        <div className="lateral-pie">
          {/* type="reset" devuelve el formulario a sus valores iniciales */}
          <button type="reset" className="lateral-restablecer">
            Restablecer filtros
          </button>
        </div>
      </form>
    </aside>
  );
}
