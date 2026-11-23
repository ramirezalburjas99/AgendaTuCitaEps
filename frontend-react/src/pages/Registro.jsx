import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import usePageStyles from '../hooks/usePageStyles.js'
import { registrarPaciente } from '../services/api.js'

// Estado inicial: todos los campos vacíos. Los nombres coinciden con la entidad Pacientes.
const VACIO = {
  tipoDeDocumento: '', documento: '', nombreCompleto: '', genero: '',
  fechaNacimiento: '', correo: '', eps: '', direccionPaciente: '',
  telefono: '', contactoEmergencia: '', contrasena: '',
}

export default function Registro() {
  usePageStyles(['style.css'])

  const navigate = useNavigate()
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [verContrasena, setVerContrasena] = useState(false) // reemplaza alternarContrasena() de script.js

  // Una sola función para TODOS los campos:
  // e.target.name es el nombre del input que cambió; e.target.value, lo que escribió la persona.
  // Copiamos el objeto actual (...form) y cambiamos solo ese campo.
  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Se ejecuta al presionar "Guardar"
  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await registrarPaciente(form) // POST /api/auth/registro con todo el objeto form
      // Vamos al login y le mandamos un mensaje de éxito (reemplaza al flashAttribute)
      navigate('/inicio', { state: { exito: 'Tus datos se han registrado con exito' } })
    } catch (err) {
      setError(err.message) // ej: "Ya existe un paciente registrado con ese correo"
    } finally {
      setCargando(false)
    }
  }

  // Función auxiliar para no repetir el mismo bloque de HTML en cada campo de texto
  const campo = (name, etiqueta, type = 'text') => (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {etiqueta} <span className="required">*</span>
      </label>
      <input
        type={type} id={name} name={name} className="form-control" required
        value={form[name]} onChange={cambiar}
      />
    </div>
  )

  return (
    <>
      <header className="app-header">
        <div className="app-container" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
          <h1 className="app-header-title">Formulario de Registro</h1>
          <p className="app-header-description">Tome su tiempo para completar todos los campos</p>
        </div>
      </header>

      <main className="app-container" style={{ maxWidth: 800 }}>
        {error && (
          <div className="alert alert-danger">
            <p>{error}</p>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Información personal</h2>
            <p className="description">
              Los campos marcados con <span className="required">*</span> son obligatorios.
            </p>
          </div>

          <form onSubmit={enviar}>
            <div className="card-body">
              {/* Los campos con lista desplegable se escriben a mano */}
              <div className="form-group">
                <label htmlFor="tipoDeDocumento" className="form-label">
                  Tipo de documento <span className="required">*</span>
                </label>
                <select id="tipoDeDocumento" name="tipoDeDocumento" className="form-control" required
                        value={form.tipoDeDocumento} onChange={cambiar}>
                  <option value="" disabled>Seleccione...</option>
                  <option value="CC">CC - Cédula de ciudadanía</option>
                  <option value="PA">PA - Pasaporte</option>
                  <option value="CE">CE - Cédula de extranjería</option>
                  <option value="PT">PT - Permiso por protección temporal</option>
                </select>
              </div>

              {/* Los de texto usan la función auxiliar "campo" */}
              {campo('documento', 'Número de documento', 'number')}
              {campo('nombreCompleto', 'Nombre completo')}

              <div className="form-group">
                <label htmlFor="genero" className="form-label">
                  Género <span className="required">*</span>
                </label>
                <select id="genero" name="genero" className="form-control" required
                        value={form.genero} onChange={cambiar}>
                  <option value="" disabled>Seleccione...</option>
                  <option value="F">Femenino</option>
                  <option value="M">Masculino</option>
                  <option value="O">Otro</option>
                </select>
              </div>

              {campo('fechaNacimiento', 'Fecha de nacimiento', 'date')}
              {campo('correo', 'Correo', 'email')}
              {campo('eps', 'EPS')}
              {campo('direccionPaciente', 'Dirección de residencia')}
              {campo('telefono', 'Teléfono', 'number')}
              {campo('contactoEmergencia', 'Contacto de emergencia', 'number')}

              <div className="form-group">
                <label htmlFor="contrasena" className="form-label">
                  Contraseña <span className="required">*</span>
                </label>
                {/* El type cambia entre password y text según el checkbox */}
                <input
                  type={verContrasena ? 'text' : 'password'} id="contrasena" name="contrasena"
                  className="form-control" required value={form.contrasena} onChange={cambiar}
                />
                <label style={{ fontSize: '0.85rem', display: 'block', marginTop: '0.4rem' }}>
                  <input type="checkbox" checked={verContrasena}
                         onChange={(e) => setVerContrasena(e.target.checked)} /> Mostrar contraseña
                </label>
              </div>
            </div>

            <div className="card-footer" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Link to="/inicio" className="btn btn-secondary">Volver</Link>
              <button type="submit" className="btn btn-primary" disabled={cargando}>
                {cargando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
