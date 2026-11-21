package com.AgendaTuCitaEps.AgendaTuCitaEps.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CitaRequestDTO
{
    private Long idSede;
    private Long idDoctor;
    private Long idPaciente;
    private LocalDateTime fechaHora;
}
