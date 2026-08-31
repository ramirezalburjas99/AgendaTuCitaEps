package com.AgendaTuCitaEps.AgendaTuCitaEps.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name="sede")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sede
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSede;

    @NotBlank(message = "La dirección es obligatoria")
    private String direccionSede;

    @NotBlank(message = "El telefono es obligatorio")
    private String telefono;

}
