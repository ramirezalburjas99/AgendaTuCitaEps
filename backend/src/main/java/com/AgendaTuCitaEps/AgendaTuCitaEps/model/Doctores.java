package com.AgendaTuCitaEps.AgendaTuCitaEps.model;


import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name="doctores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Doctores
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDoctor;


    @NotBlank(message = "El tipo de documento es obligatorio")
    private String tipoDeDocumento;


    @NotBlank(message = "El documento es obligatorio")
    private String documento;


    @NotBlank(message= "El nombre es obligatorio")
    private String nombreCompleto;


    @NotBlank(message = "La licencia medica es obligatoria")
    private String licencia;
    // Especialidad médica ("Medicina General", "Traumatología", "Pediatría")
    private String especialidad;

    // Consultorio asignado ("Consultorio 204")
    private String consultorio;


    @NotBlank(message = "El correo es obligatorio")
    private String correo;


    @NotBlank(message = "La dirección es obligatoria")
    private String direccionDoctor;


    @NotBlank(message = "El telefono es obligatorio")
    private String telefono;


    @NotBlank(message = "El contacto de emergencia es obligatorio")
    private String contactoEmergencia;


    @NotBlank(message = "La contraseña es obligatoria")
    // Evita que GET /API/DOCTORES envie las contraseñas en el JSON de respuesta
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String contrasena;

    @ManyToOne
    @JoinColumn(name = "id_sede")
    private Sede sede;
}
