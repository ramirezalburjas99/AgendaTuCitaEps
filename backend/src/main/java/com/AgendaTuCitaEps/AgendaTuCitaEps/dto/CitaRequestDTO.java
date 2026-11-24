package com.AgendaTuCitaEps.AgendaTuCitaEps.dto;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.tomcat.util.http.fileupload.util.Streams;

import java.time.LocalDateTime;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CitaRequestDTO
{
    private Long idSede;
    @NotNull(message = "El idDoctor es obligatorio")
    private Long idDoctor;

    @NotNull(message="El idPaciente es obligatorio")
    private Long idPaciente;

    @NotNull (message = "La fechaHora de la citaes obligatoria")
    private LocalDateTime fechaHora;

    //MOTIVO OPCIONAL de la consulta
    private String motivo;
}
