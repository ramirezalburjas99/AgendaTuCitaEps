package com.AgendaTuCitaEps.AgendaTuCitaEps.service;

import com.AgendaTuCitaEps.AgendaTuCitaEps.dto.*;
import com.AgendaTuCitaEps.AgendaTuCitaEps.exception.ApiException;
import com.AgendaTuCitaEps.AgendaTuCitaEps.model.*;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CitaService {

    // Parámetros de agenda sincronizados con Calendario.jsx (09:00 a 16:30, bloques de 30 min)
    private static final LocalTime HORA_INICIO = LocalTime.of(9, 0);
    private static final LocalTime ULTIMO_TURNO = LocalTime.of(16, 0);
    private static final int DURACION_MINUTOS = 30;
    private static final DateTimeFormatter FMT_HORA = DateTimeFormatter.ofPattern("HH:mm");

    private final CitasRepository citasRepository;
    private final DoctoresRepository doctoresRepository;
    private final PacientesRepository pacientesRepository;
    private final SedeRepository sedeRepository;

    public CitaService(CitasRepository citasRepository,
                       DoctoresRepository doctoresRepository,
                       PacientesRepository pacientesRepository,
                       SedeRepository sedeRepository) {
        this.citasRepository = citasRepository;
        this.doctoresRepository = doctoresRepository;
        this.pacientesRepository = pacientesRepository;
        this.sedeRepository = sedeRepository;
    }

    /**
     * Agenda una nueva cita y bloquea ese día/hora para el doctor seleccionado.
     * La anotación @Transactional garantiza atomicidad en la consulta y guardado.
     */
    @Transactional
    public CitaResponseDTO agendarCita(CitaRequestDTO dto) {
        LocalDateTime fechaHora = dto.getFechaHora();
        validarHorarioPermitido(fechaHora);

        Doctores doctor = doctoresRepository.findById(dto.getIdDoctor())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "El doctor seleccionado no existe"));

        Pacientes paciente = pacientesRepository.findById(dto.getIdPaciente())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "El paciente no existe"));

        // Resolver sede: prioridad al idSede enviado; si viene null, usa la sede del doctor
        Sede sede = resolverSede(dto.getIdSede(), doctor);

        // 1. Verificar si ese espacio del doctor ya está bloqueado por otra cita CONFIRMADA
        boolean doctorOcupado = citasRepository.existsByDoctor_IdDoctorAndFechaHoraAndEstado(
                doctor.getIdDoctor(), fechaHora, EstadoCita.CONFIRMADA);
        if (doctorOcupado) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Este horario ya fue reservado con el doctor seleccionado. Elige otra franja disponible.");
        }

        // 2. Verificar que el paciente no tenga ya otra cita confirmada exactamente a la misma hora
        boolean pacienteOcupado = citasRepository.existsByPaciente_IdPacienteAndFechaHoraAndEstado(
                paciente.getIdPaciente(), fechaHora, EstadoCita.CONFIRMADA);
        if (pacienteOcupado) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Ya tienes otra cita confirmada en esa misma fecha y hora.");
        }

        Citas nuevaCita = Citas.builder()
                .doctor(doctor)
                .paciente(paciente)
                .sede(sede)
                .fechaHora(fechaHora)
                .estado(EstadoCita.CONFIRMADA)
                .motivo(dto.getMotivo())
                .build();

        Citas guardada = citasRepository.save(nuevaCita);
        return convertirADTO(guardada);
    }

    /**
     * Cancela una cita existente y libera el horario en el calendario.
     */
    @Transactional
    public CitaResponseDTO cancelarCita(Long idCita) {
        Citas cita = citasRepository.findById(idCita)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cita no encontrada"));

        if (cita.getEstado() == EstadoCita.CANCELADA) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La cita ya se encuentra cancelada");
        }

        cita.setEstado(EstadoCita.CANCELADA);
        return convertirADTO(citasRepository.save(cita));
    }

    /**
     * Calcula los bloques horarios (disponibles y bloqueados) para un doctor en una fecha puntual.
     */
    @Transactional(readOnly = true)
    public List<SlotCalendarioDTO> obtenerDisponibilidadPorFecha(Long idDoctor, LocalDate fecha) {
        Doctores doctor = doctoresRepository.findById(idDoctor)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Doctor no encontrado"));

        if (esFinDeSemana(fecha)) {
            return List.of(); // No hay atención sábado ni domingo
        }

        LocalDateTime inicioDia = fecha.atTime(HORA_INICIO);
        LocalDateTime finDia = fecha.atTime(23, 59);

        List<Citas> citasDelDia = citasRepository
                .findByDoctor_IdDoctorAndFechaHoraBetweenAndEstadoOrderByFechaHoraAsc(
                        idDoctor, inicioDia, finDia, EstadoCita.CONFIRMADA);

        Map<LocalDateTime, Citas> mapaOcupadas = citasDelDia.stream()
                .collect(Collectors.toMap(Citas::getFechaHora, c -> c, (a, b) -> a));

        List<SlotCalendarioDTO> slots = new ArrayList<>();
        LocalTime cursor = HORA_INICIO;

        while (!cursor.isAfter(ULTIMO_TURNO)) {
            LocalDateTime instante = fecha.atTime(cursor);
            Citas citaExistente = mapaOcupadas.get(instante);
            slots.add(construirSlot(doctor, instante, citaExistente));
            cursor = cursor.plusMinutes(DURACION_MINUTOS);
        }

        return slots;
    }

    /**
     * Genera la agenda semanal completa (lunes a viernes) para alimentar Calendario.jsx.
     * Si se pasa idDoctor, filtra por ese médico; si es null, toma el primer doctor activo.
     */
    @Transactional(readOnly = true)
    public List<SlotCalendarioDTO> obtenerAgendaSemanal(LocalDate fechaReferencia, Long idDoctor) {
        LocalDate lunes = fechaReferencia.with(DayOfWeek.MONDAY);
        LocalDate viernes = lunes.plusDays(4);

        Doctores doctorObjetivo;
        if (idDoctor != null) {
            doctorObjetivo = doctoresRepository.findById(idDoctor)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Doctor no encontrado"));
        } else {
            doctorObjetivo = doctoresRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No hay doctores registrados"));
        }

        LocalDateTime inicioSemana = lunes.atStartOfDay();
        LocalDateTime finSemana = viernes.atTime(23, 59, 59);

        List<Citas> citasSemana = citasRepository
                .findByDoctor_IdDoctorAndFechaHoraBetweenAndEstadoOrderByFechaHoraAsc(
                        doctorObjetivo.getIdDoctor(), inicioSemana, finSemana, EstadoCita.CONFIRMADA);

        Map<LocalDateTime, Citas> mapaCitas = citasSemana.stream()
                .collect(Collectors.toMap(Citas::getFechaHora, c -> c, (a, b) -> a));

        List<SlotCalendarioDTO> resultado = new ArrayList<>();

        for (int d = 0; d < 5; d++) {
            LocalDate diaActual = lunes.plusDays(d);
            LocalTime cursor = HORA_INICIO;
            while (!cursor.isAfter(ULTIMO_TURNO)) {
                LocalDateTime instante = diaActual.atTime(cursor);
                Citas ocupada = mapaCitas.get(instante);
                resultado.add(construirSlot(doctorObjetivo, instante, ocupada));
                cursor = cursor.plusMinutes(DURACION_MINUTOS);
            }
        }

        return resultado;
    }

    @Transactional(readOnly = true)
    public List<CitaResponseDTO> listarPorPaciente(Long idPaciente) {
        return citasRepository.findByPaciente_IdPacienteOrderByFechaHoraDesc(idPaciente)
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CitaResponseDTO> listarPorDoctor(Long idDoctor, LocalDate fecha) {
        if (fecha != null) {
            return citasRepository
                    .findByDoctor_IdDoctorAndFechaHoraBetweenAndEstadoOrderByFechaHoraAsc(
                            idDoctor, fecha.atStartOfDay(), fecha.atTime(23, 59, 59), EstadoCita.CONFIRMADA)
                    .stream()
                    .map(this::convertirADTO)
                    .toList();
        }
        return citasRepository.findByDoctor_IdDoctorOrderByFechaHoraAsc(idDoctor)
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    // ------------------ Métodos auxiliares privados ------------------

    private void validarHorarioPermitido(LocalDateTime fechaHora) {
        if (fechaHora == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Debe indicar la fecha y hora de la cita");
        }
        if (fechaHora.isBefore(LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No es posible agendar citas en fechas u horas pasadas");
        }
        if (esFinDeSemana(fechaHora.toLocalDate())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La atención médica es únicamente de lunes a viernes");
        }
        LocalTime hora = fechaHora.toLocalTime();
        if (hora.isBefore(HORA_INICIO) || hora.isAfter(ULTIMO_TURNO)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El horario de atención es de 09:00 a 16:30");
        }
        if (hora.getMinute() % DURACION_MINUTOS != 0 || hora.getSecond() != 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Las citas deben agendarse en bloques exactos de 30 minutos (ej. 09:00, 09:30)");
        }
    }

    private boolean esFinDeSemana(LocalDate fecha) {
        DayOfWeek dia = fecha.getDayOfWeek();
        return dia == DayOfWeek.SATURDAY || dia == DayOfWeek.SUNDAY;
    }

    private Sede resolverSede(Long idSedeSolicitada, Doctores doctor) {
        if (idSedeSolicitada != null) {
            return sedeRepository.findById(idSedeSolicitada)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "La sede indicada no existe"));
        }
        if (doctor.getSede() != null) {
            return doctor.getSede();
        }
        return sedeRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                        "No hay sedes configuradas en el sistema. Registra al menos una sede."));
    }

    private SlotCalendarioDTO construirSlot(Doctores doctor, LocalDateTime instante, Citas citaExistente) {
        boolean ocupado = (citaExistente != null);
        return SlotCalendarioDTO.builder()
                .tipo(ocupado ? "cita" : "disponible")
                .fecha(instante.toLocalDate().toString())
                .hora(instante.toLocalTime().format(FMT_HORA))
                .fechaHoraIso(instante.toString())
                .disponible(!ocupado)
                .idDoctor(doctor.getIdDoctor())
                .nombreDoctor(doctor.getNombreCompleto())
                .especialidad(doctor.getEspecialidad() != null ? doctor.getEspecialidad() : "Medicina General")
                .idSede(doctor.getSede() != null ? doctor.getSede().getIdSede() : null)
                .idCita(ocupado ? citaExistente.getIdCita() : null)
                .idPaciente(ocupado ? citaExistente.getPaciente().getIdPaciente() : null)
                .nombrePaciente(ocupado ? citaExistente.getPaciente().getNombreCompleto() : null)
                .build();
    }

    public CitaResponseDTO convertirADTO(Citas cita) {
        SedeResumenDTO sedeDTO = SedeResumenDTO.builder()
                .idSede(cita.getSede().getIdSede())
                .direccionSede(cita.getSede().getDireccionSede())
                .telefono(cita.getSede().getTelefono())
                .build();

        DoctorResumenDTO doctorDTO = DoctorResumenDTO.builder()
                .idDoctor(cita.getDoctor().getIdDoctor())
                .nombreCompleto(cita.getDoctor().getNombreCompleto())
                .especialidad(cita.getDoctor().getEspecialidad())
                .consultorio(cita.getDoctor().getConsultorio())
                .correo(cita.getDoctor().getCorreo())
                .sede(sedeDTO)
                .build();

        PacientesResumenDTO pacienteDTO = PacientesResumenDTO.builder()
                .idPaciente(cita.getPaciente().getIdPaciente())
                .nombreCompleto(cita.getPaciente().getNombreCompleto())
                .correo(cita.getPaciente().getCorreo())
                .build();

        return CitaResponseDTO.builder()
                .idCita(cita.getIdCita())
                .doctor(doctorDTO)
                .paciente(pacienteDTO)
                .sede(sedeDTO)
                .fechaHora(cita.getFechaHora())
                .estado(cita.getEstado())
                .motivo(cita.getMotivo())
                .build();
    }
}
