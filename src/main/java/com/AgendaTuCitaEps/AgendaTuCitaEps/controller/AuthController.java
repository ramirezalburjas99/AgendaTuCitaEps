package com.AgendaTuCitaEps.AgendaTuCitaEps.controller;

import com.AgendaTuCitaEps.AgendaTuCitaEps.model.Pacientes;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.PacientesRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

//Cada método devuelve datos (JSON), NO LA PÁGINA HTML, como se hace en otros controller
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final PacientesRepository pacientesRepository;

    public AuthController(PacientesRepository pacientesRepository) {
        this.pacientesRepository = pacientesRepository;
    }

    public record LoginRequest(String correo, String contrasena) {}

    // Forma del JSON que REACT envia al iniciar sesión
    public record PacienteSesionDTO(Long idPaciente, String noombreCompleto, String correo) {
    }

    // POST /API/AUTH/LOGIN reemplaza a LoginController.procesarLogin
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Pacientes p = pacientesRepository.findByCorreoAndContrasena(req.correo(), req.contrasena());
        if (p == null) {
            //401= NO AUTORIZADO. REACT muestra este mensaje en pantalla.
            return ResponseEntity.status(401).body(Map.of("mensaje", "Correo o contraseña incorrectos"));
        }
        return ResponseEntity.ok(new PacienteSesionDTO(p.getIdPaciente(), p.getNombreCompleto(), p.getCorreo()));
    }

    // POST /API/AUTH/REGISTRO (reemplaza a AutoRegistroView.save)
    // @Valid activa las validaciones @Notblank si falta un campo, responde 400
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@Valid @RequestBody Pacientes paciente) {
        if (pacientesRepository.existsByCorreo(paciente.getCorreo())) {
            //409 = CONFLICTO: YA EXISTE UN RECURSO CON ESE DATO
            return ResponseEntity.status(409).body(Map.of("mensaje", "Ya existe un paciente registrado con ese correo"));
        }
        paciente.setIdPaciente(null); // el ID siempre lo genera la BD y nunca el cliente

        Pacientes guardado = pacientesRepository.save(paciente);
        return ResponseEntity.status(201).body(new PacienteSesionDTO(guardado.getIdPaciente(), guardado.getNombreCompleto(), guardado.getCorreo()));
    }
}













