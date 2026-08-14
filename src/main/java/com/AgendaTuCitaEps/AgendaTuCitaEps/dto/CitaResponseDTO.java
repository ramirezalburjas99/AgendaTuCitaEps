package com.AgendaTuCitaEps.AgendaTuCitaEps.dto;

import com.AgendaTuCitaEps.AgendaTuCitaEps.model.EstadoCita;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitaResponseDTO
{
    private Long idCita;
    private DoctorResumenDTO doctor;
    private PacientesResumenDTO paciente;
    private SedeResumenDTO sede;
    private LocalDateTime fechaHora;
    private EstadoCita estado;
}
