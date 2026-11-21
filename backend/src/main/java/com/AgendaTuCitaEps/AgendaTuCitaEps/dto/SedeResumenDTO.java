package com.AgendaTuCitaEps.AgendaTuCitaEps.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SedeResumenDTO
{
    private Long idSede;
    private String direccionSede;
    private String telefono;
}
