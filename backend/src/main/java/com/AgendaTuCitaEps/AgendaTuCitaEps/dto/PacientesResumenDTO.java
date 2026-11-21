package com.AgendaTuCitaEps.AgendaTuCitaEps.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacientesResumenDTO
{
    private Long idPaciente;
    private String nombreCompleto;
    private String correo;
}
