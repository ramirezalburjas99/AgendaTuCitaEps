package com.AgendaTuCitaEps.AgendaTuCitaEps.repository;

import com.AgendaTuCitaEps.AgendaTuCitaEps.model.Citas;
import com.AgendaTuCitaEps.AgendaTuCitaEps.model.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CitasRepository extends JpaRepository<Citas, Long>
{
    // Verifica si el paciente tiene otra cita CONFIRMADA a esa misma hora (evita doble reserva del paciente)
    boolean existsByDoctor_IdDoctorAndFechaHoraAndEstado(
            long idDoctor, LocalDateTime fechaHora, EstadoCita estado);

        // Obtiene las citas activas de un doctor específico dentro de un rango de fechas
    List<Citas> findByFechaHotaBetweenAndEstadoOrderByFechaHoraAsc(
                LocalDateTime inicio,LocalDateTime fin, EstadoCita estado);

    // Lista el historial y próximas citas de un paciente ordenadas de más reciente a más antigua
    List<Citas> findByPaciente_IdPacienteOrderByFechaHoraDesc(Long idPaciente);

    //Lista todas las citas de un doctor ordenadas cronológicamente
    List<Citas> findByDoctor_IdDoctorOrderByFechaHoraAsc(Long idDoctor);
}
