package com.AgendaTuCitaEps.AgendaTuCitaEps.dto;

import lombok.*;

//Representa una casilla del calendario semanal (franja de 30 minutos).
// tipo: "disponible" (puede reservarse) o "cita" (bloqueada porque ya fue agendada).
 //
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotCalendarioDTO {
    private String tipo;           // "disponible" | "cita"
    private String fecha;          // "YYYY-MM-DD" (ej. "2026-11-26")
    private String hora;           // "HH:mm" (ej. "09:30")
    private String fechaHoraIso;   // "2026-11-26T09:30:00" lista para enviar en POST /api/citas
    private boolean disponible;    // true si se puede agendar, false si está bloqueado

    private Long idDoctor;
    private String nombreDoctor;
    private String especialidad;
    private Long idSede;

    // Datos presentes únicamente cuando tipo == "cita" (espacio bloqueado)
    private Long idCita;
    private Long idPaciente;
    private String nombrePaciente;
}
