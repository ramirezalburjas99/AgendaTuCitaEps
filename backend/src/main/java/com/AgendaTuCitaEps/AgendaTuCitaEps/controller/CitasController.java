package com.AgendaTuCitaEps.AgendaTuCitaEps.controller;

import com.AgendaTuCitaEps.AgendaTuCitaEps.dto.CitaRequestDTO;
import com.AgendaTuCitaEps.AgendaTuCitaEps.dto.CitaResponseDTO;
import com.AgendaTuCitaEps.AgendaTuCitaEps.dto.SlotCalendarioDTO;
import com.AgendaTuCitaEps.AgendaTuCitaEps.exception.ApiException;
import com.AgendaTuCitaEps.AgendaTuCitaEps.model.Citas;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.CitasRepository;
import com.AgendaTuCitaEps.AgendaTuCitaEps.service.CitaService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/citas")
public class CitasController {

    private final CitaService citaService;
    private final CitasRepository citasRepository;

    public CitasController(CitaService citaService, CitasRepository citasRepository) {
        this.citaService = citaService;
        this.citasRepository = citasRepository;
    }

    // GET /api/citas -> Lista todas las citas registradas
    @GetMapping
    public ResponseEntity<List<CitaResponseDTO>> getAll() {
        List<CitaResponseDTO> lista = citasRepository.findAll()
                .stream()
                .map(citaService::convertirADTO)
                .toList();
        return ResponseEntity.ok(lista);
    }

    // GET /api/citas/{id} -> Obtiene una cita por su ID
    @GetMapping("/{id}")
    public ResponseEntity<CitaResponseDTO> getById(@PathVariable Long id) {
        Citas cita = citasRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cita no encontrada"));
        return ResponseEntity.ok(citaService.convertirADTO(cita));
    }

    // GET /api/citas/agenda-semanal?lunes=2026-11-23&doctorId=1
    // Devuelve las casillas de lunes a viernes (disponibles y confirmadas) para el calendario
    @GetMapping("/agenda-semanal")
    public ResponseEntity<List<SlotCalendarioDTO>> getAgendaSemanal(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate lunes,
            @RequestParam(required = false) Long doctorId) {
        LocalDate fechaBase = (lunes != null) ? lunes : LocalDate.now();
        return ResponseEntity.ok(citaService.obtenerAgendaSemanal(fechaBase, doctorId));
    }

    // GET /api/citas/disponibilidad?doctorId=1&fecha=2026-11-26
    // Devuelve los horarios de 30 minutos de un doctor en un día puntual
    @GetMapping("/disponibilidad")
    public ResponseEntity<List<SlotCalendarioDTO>> getDisponibilidadDia(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(citaService.obtenerDisponibilidadPorFecha(doctorId, fecha));
    }

    // GET /api/citas/paciente/{idPaciente} -> Citas de un paciente específico
    @GetMapping("/paciente/{idPaciente}")
    public ResponseEntity<List<CitaResponseDTO>> getPorPaciente(@PathVariable Long idPaciente) {
        return ResponseEntity.ok(citaService.listarPorPaciente(idPaciente));
    }

    // GET /api/citas/doctor/{idDoctor}?fecha=2026-11-26 -> Agenda de un doctor
    @GetMapping("/doctor/{idDoctor}")
    public ResponseEntity<List<CitaResponseDTO>> getPorDoctor(
            @PathVariable Long idDoctor,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(citaService.listarPorDoctor(idDoctor, fecha));
    }

    // POST /api/citas -> Agenda una cita y bloquea el día y hora seleccionados
    @PostMapping
    public ResponseEntity<CitaResponseDTO> create(@Valid @RequestBody CitaRequestDTO dto) {
        CitaResponseDTO creada = citaService.agendarCita(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    // PATCH /api/citas/{id}/cancelar -> Libera el espacio agendado
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<CitaResponseDTO> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.cancelarCita(id));
    }

    // DELETE /api/citas/{id} -> Elimina físicamente el registro de cita
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!citasRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Cita no encontrada");
        }
        citasRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
