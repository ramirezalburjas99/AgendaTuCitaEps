package com.AgendaTuCitaEps.AgendaTuCitaEps.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="citas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Citas
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCita;

    @ManyToOne
    @JoinColumn (name = "idSede", nullable = false)
    private Sede sede;

    @ManyToOne
    @JoinColumn(name = "idDoctor", nullable = false)
    private Doctores doctor;

    @ManyToOne
    @JoinColumn(name = "idPaciente", nullable = false)
    private Pacientes paciente;

    @NotNull(message ="La fecha y hora de la cita son obligatorias")
    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @NotNull(message ="El estado de la cita es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoCita estado;

}
