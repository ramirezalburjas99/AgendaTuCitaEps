const DIAS = ["LUN", "MAR", "MIÉ", "JUE", "VIE"];
const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Horario de la agenda, en minutos desde las 00:00 (siempre en formato 24 h)
const INICIO = 8 * 60;           // 8:00 a. m.
const FIN = 17 * 60;             // 5:00 p. m. (el último control es 4:30 p. m.)
const PASO = 30;                 // controles de 30 min
const ALMUERZO_DESDE = 12 * 60;  // 12:00 m.
const ALMUERZO_HASTA = 14 * 60;  // 2:00 p. m.
const FILA_PX = 44;
const FILA_ALMUERZO_PX = 14;

// Datos de demo. "dia": 0 = lunes ... 4 = viernes de la semana actual.
// Las horas van en 24 h ("14:00"); en pantalla se muestran como 2:00 p. m.
// Cuando conecte el backend, se reemplaza esto por los datos reales (con "fecha").
const eventosDemo = [
    // Lunes
    { tipo: "cita", dia: 0, hora: "09:00", paciente: "Elena García", doctor: "A. Martínez" },
    { tipo: "cita", dia: 0, hora: "09:30", paciente: "Jorge Mendoza", doctor: "C. Ruiz" },
    { tipo: "disponible", dia: 0, hora: "10:00", doctor: "A. Martínez" },
    { tipo: "disponible", dia: 0, hora: "10:30", doctor: "C. Ruiz" },
    { tipo: "disponible", dia: 0, hora: "11:00", doctor: "L. Torres" },
    { tipo: "disponible", dia: 0, hora: "11:30", doctor: "A. Martínez" },
    { tipo: "disponible", dia: 0, hora: "14:00", doctor: "A. Martínez" },
    { tipo: "disponible", dia: 0, hora: "14:30", doctor: "L. Torres" },
    { tipo: "disponible", dia: 0, hora: "15:00", doctor: "C. Ruiz" },
    // Martes
    { tipo: "cita", dia: 1, hora: "09:00", paciente: "Pablo Sánchez", doctor: "C. Ruiz" },
    { tipo: "disponible", dia: 1, hora: "10:00", doctor: "A. Martínez" },
    { tipo: "cita", dia: 1, hora: "11:00", paciente: "Sofía Herrera", doctor: "L. Torres" },
    { tipo: "cita", dia: 1, hora: "14:00", paciente: "Diego Morales", doctor: "A. Martínez" },
    { tipo: "disponible", dia: 1, hora: "15:30", doctor: "L. Torres" },
    // Miércoles
    { tipo: "cita", dia: 2, hora: "09:30", paciente: "Valeria López", doctor: "A. Martínez" },
    { tipo: "disponible", dia: 2, hora: "10:30", doctor: "L. Torres" },
    { tipo: "disponible", dia: 2, hora: "14:00", doctor: "A. Martínez" },
    { tipo: "cita", dia: 2, hora: "15:00", paciente: "Marta Fernández", doctor: "L. Torres" },
    // Viernes
    { tipo: "cita", dia: 4, hora: "09:30", paciente: "Camila Flores", doctor: "A. Martínez" },
    { tipo: "disponible", dia: 4, hora: "11:00", doctor: "C. Ruiz" },
    { tipo: "disponible", dia: 4, hora: "14:30", doctor: "A. Martínez" },
    { tipo: "cita", dia: 4, hora: "16:00", paciente: "Luis Vega", doctor: "C. Ruiz" }
];

const eventos = eventosDemo.map(ev => ({
    ...ev,
    fecha: aClave(sumarDias(lunesDe(new Date()), ev.dia))
}));

// Índice para buscar rápido por "fecha|hora" (un evento por celda)
const indiceEventos = new Map();
for (const ev of eventos) {
    indiceEventos.set(ev.fecha + "|" + ev.hora, ev);
}

// ------------------------------------------------------------
// Estado
// ------------------------------------------------------------
let lunesActual = lunesDe(new Date());
let seleccionado = null; // clave "fecha|hora" del horario elegido

const contenedor = document.getElementById("contenedor-calendario");

// ------------------------------------------------------------
// Utilidades de fecha
// ------------------------------------------------------------
function lunesDe(fecha) {
    const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const dia = d.getDay(); // 0 = domingo
    d.setDate(d.getDate() + (dia === 0 ? -6 : 1 - dia));
    return d;
}

function sumarDias(fecha, n) {
    const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    d.setDate(d.getDate() + n);
    return d;
}

function aClave(fecha) {
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    return fecha.getFullYear() + "-" + m + "-" + d;
}

function aHora(minutos) {
    const h = String(Math.floor(minutos / 60)).padStart(2, "0");
    const m = String(minutos % 60).padStart(2, "0");
    return h + ":" + m;
}

// "14:30" -> 870
function aMinutos(hora) {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
}

// 870 -> "2:30 p. m." (solo para mostrar en pantalla)
function formatoHora12(minutos) {
    const h24 = Math.floor(minutos / 60);
    const m = String(minutos % 60).padStart(2, "0");
    const sufijo = h24 >= 12 ? "p. m." : "a. m.";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return h12 + ":" + m + " " + sufijo;
}

function semanaISO(fecha) {
    const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
    const diaSemana = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - diaSemana);
    const inicioAnio = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - inicioAnio) / 86400000 + 1) / 7);
}

function mayuscula(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Crea un elemento con clase y texto opcionales
function el(etiqueta, clase, texto) {
    const nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
}

// ------------------------------------------------------------
// Construcción de cada parte
// ------------------------------------------------------------
function crearBarraSuperior(viernes) {
    const barra = el("div", "cal-barra");

    const izquierda = el("div", "cal-barra-izq");
    const titulo = el("h3", "cal-titulo",
        mayuscula(MESES[lunesActual.getMonth()]) + " " + lunesActual.getFullYear());

    const btnAnterior = el("button", "cal-icono", "‹");
    btnAnterior.setAttribute("aria-label", "Semana anterior");
    btnAnterior.addEventListener("click", () => cambiarSemana(-1));

    const btnSiguiente = el("button", "cal-icono", "›");
    btnSiguiente.setAttribute("aria-label", "Semana siguiente");
    btnSiguiente.addEventListener("click", () => cambiarSemana(1));

    const btnHoy = el("button", "cal-hoy", "Hoy");
    btnHoy.addEventListener("click", irAHoy);

    izquierda.append(titulo, btnAnterior, btnSiguiente, btnHoy);

    // Vistas: por ahora solo funciona Semana
    const vistas = el("div", "cal-vistas");
    for (const nombre of ["Día", "Semana", "Mes"]) {
        const b = el("button", "cal-vista", nombre);
        if (nombre === "Semana") {
            b.classList.add("activa");
        } else {
            b.disabled = true;
            b.title = "Próximamente";
        }
        vistas.appendChild(b);
    }

    barra.append(izquierda, vistas);

    const rango = el("div", "cal-rango");
    const textoRango = lunesActual.getDate() + " – " + viernes.getDate() + " de " +
        MESES[viernes.getMonth()] + " · Semana " + semanaISO(lunesActual);
    rango.append(el("span", "", textoRango), el("span", "", "Controles de " + PASO + " min"));

    const cabecera = el("div", "cal-cabecera");
    cabecera.append(barra, rango);
    return cabecera;
}

function crearEncabezadosDias(grilla) {
    const esquina = el("div", "cal-esquina", "GMT-5");
    esquina.style.gridRow = 1;
    esquina.style.gridColumn = 1;
    grilla.appendChild(esquina);

    const claveHoy = aClave(new Date());

    for (let i = 0; i < DIAS.length; i++) {
        const fecha = sumarDias(lunesActual, i);
        const esHoy = aClave(fecha) === claveHoy;

        const celda = el("div", "cal-dia");
        if (esHoy) celda.classList.add("hoy");
        celda.style.gridRow = 1;
        celda.style.gridColumn = i + 2;

        celda.appendChild(el("span", "cal-dia-nombre", DIAS[i] + (esHoy ? " · HOY" : "")));
        celda.appendChild(el("span", "cal-dia-numero", fecha.getDate()));
        grilla.appendChild(celda);
    }
}

function crearEvento(ev) {
    if (ev.tipo === "cita") {
        const nodo = el("div", "cal-evento cal-cita");
        nodo.append(
            el("span", "cal-evento-principal", ev.paciente),
            el("span", "cal-evento-detalle", formatoHora12(aMinutos(ev.hora)) + " · " + ev.doctor)
        );
        return nodo;
    }

    const nodo = el("button", "cal-evento cal-disponible");
    nodo.type = "button";
    nodo.append(
        el("span", "cal-evento-principal", formatoHora12(aMinutos(ev.hora)) + " · Disponible"),
        el("span", "cal-evento-detalle", ev.doctor)
    );
    return nodo;
}

function crearFilas(grilla) {
    const totalFilas = (FIN - INICIO) / PASO;

    for (let f = 0; f < totalFilas; f++) {
        const minutos = INICIO + f * PASO;
        const fila = f + 2; // la fila 1 es el encabezado

        // Etiqueta de hora (solo en horas en punto)
        const etiqueta = el("div", "cal-hora", minutos % 60 === 0 ? formatoHora12(minutos) : "");
        etiqueta.style.gridRow = fila;
        etiqueta.style.gridColumn = 1;
        grilla.appendChild(etiqueta);

        const enAlmuerzo = minutos >= ALMUERZO_DESDE && minutos < ALMUERZO_HASTA;

        for (let d = 0; d < DIAS.length; d++) {
            // El bloque de almuerzo ocupa dos filas: se crea solo en la primera fila del almuerzo
            if (enAlmuerzo && minutos !== ALMUERZO_DESDE) continue;

            const celda = el("div", "cal-celda");
            celda.style.gridColumn = d + 2;

            if (enAlmuerzo) {
                celda.classList.add("cal-bloqueado");
                celda.style.gridRow = fila + " / span " + ((ALMUERZO_HASTA - ALMUERZO_DESDE) / PASO);
                celda.textContent = "No disponible";
                grilla.appendChild(celda);
                continue;
            }

            celda.style.gridRow = fila;

            const clave = aClave(sumarDias(lunesActual, d)) + "|" + aHora(minutos);
            const ev = indiceEventos.get(clave);

            if (ev) {
                const nodo = crearEvento(ev);
                if (ev.tipo === "disponible") {
                    if (clave === seleccionado) nodo.classList.add("seleccionado");
                    nodo.addEventListener("click", () => seleccionar(clave));
                }
                celda.appendChild(nodo);
            }
            grilla.appendChild(celda);
        }
    }
}

function crearPie() {
    const pie = el("div", "cal-pie");

    const leyenda = el("div", "cal-leyenda");
    const itemCita = el("span", "cal-leyenda-item");
    itemCita.append(el("i", "cal-muestra cal-muestra-cita"), "Cita confirmada");
    const itemDisp = el("span", "cal-leyenda-item");
    itemDisp.append(el("i", "cal-muestra cal-muestra-disp"), "Horario disponible");
    leyenda.append(itemCita, itemDisp);

    const mensaje = el("span", "cal-mensaje");
    mensaje.setAttribute("aria-live", "polite");
    if (seleccionado) {
        const [fecha, hora] = seleccionado.split("|");
        const ev = indiceEventos.get(seleccionado);
        const [, mes, dia] = fecha.split("-");
        mensaje.textContent = "Seleccionado: " + Number(dia) + "/" + mes + " a las " + formatoHora12(aMinutos(hora)) + " con " + ev.doctor;
    } else {
        mensaje.textContent = "Selecciona un horario para agendar";
    }

    pie.append(leyenda, mensaje);
    return pie;
}

// ------------------------------------------------------------
// Render principal
// ------------------------------------------------------------
function renderSemana() {
    const viernes = sumarDias(lunesActual, 4);

    const grilla = el("div", "cal-grilla");
    crearEncabezadosDias(grilla);
    crearFilas(grilla);

    const alturas = [];
    for (let m = INICIO; m < FIN; m += PASO){
        const almuerzo = m >= ALMUERZO_DESDE && m < ALMUERZO_HASTA;
        alturas.push((almuerzo ? FILA_ALMUERZO_PX : FILA_PX) + "px");
    }
    grilla.style.gridTemplateRows = "64px " + alturas.join(" ");

    const tarjeta = el("div", "cal-tarjeta");
    tarjeta.append(crearBarraSuperior(viernes), grilla, crearPie());

    contenedor.replaceChildren(tarjeta);
}

// ------------------------------------------------------------
// Acciones
// ------------------------------------------------------------
function cambiarSemana(direccion) {
    lunesActual = sumarDias(lunesActual, direccion * 7);
    seleccionado = null;
    renderSemana();
}

function irAHoy() {
    lunesActual = lunesDe(new Date());
    seleccionado = null;
    renderSemana();
}

function seleccionar(clave) {
    seleccionado = (seleccionado === clave) ? null : clave; // clic de nuevo = quitar
    renderSemana();
}

renderSemana();