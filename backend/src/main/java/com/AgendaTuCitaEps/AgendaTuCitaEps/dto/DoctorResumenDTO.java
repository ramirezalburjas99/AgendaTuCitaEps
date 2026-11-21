package com.AgendaTuCitaEps.AgendaTuCitaEps.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorResumenDTO
{
    private Long idDoctor;
    private String nombreCompleto;
    private String correo;
}
