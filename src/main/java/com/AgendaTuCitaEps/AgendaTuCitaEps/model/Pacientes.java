package com.AgendaTuCitaEps.AgendaTuCitaEps.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name="pacientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pacientes
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPaciente;

    @NotBlank(message = "El tipo de documento es obligatorio")
    private String tipoDeDocumento;

    @NotBlank(message = "El documento es obligatorio")
    private String documento;

    @NotBlank(message= "El nombre es obligatorio")
    private String nombreCompleto;

    @NotBlank(message = "El genero es obligatorio")
    private String genero;

    @NotBlank(message = "La fecha es obligatoria")
    private String fechaNacimiento;

    @NotBlank(message = "El correo es obligatorio")
    private String correo;

    @NotBlank(message = "La EPS es obligatoria")
    private String eps;

    @NotBlank(message = "La dirección es obligatoria")
    private String direccionPaciente;

    @NotBlank(message = "El telefono es obligatorio")
    private String telefono;

    @NotBlank(message = "El contacto de emergencia es obligatorio")
    private String contactoEmergencia;

    @NotBlank(message = "La contraseña es obligatoria")
    private String contrasena;

}
