package com.AgendaTuCitaEps.AgendaTuCitaEps.controller;

import com.AgendaTuCitaEps.AgendaTuCitaEps.dto.DoctorResumenDTO;
import com.AgendaTuCitaEps.AgendaTuCitaEps.dto.SedeResumenDTO;
import com.AgendaTuCitaEps.AgendaTuCitaEps.dto.SlotCalendarioDTO;
import com.AgendaTuCitaEps.AgendaTuCitaEps.exception.ApiException;
import com.AgendaTuCitaEps.AgendaTuCitaEps.model.Doctores;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.DoctoresRepository;
import com.AgendaTuCitaEps.AgendaTuCitaEps.service.CitaService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctores")
public class DoctoresController {

    private final DoctoresRepository doctoresRepository;
    private final CitaService citaService;

    public DoctoresController(DoctoresRepository doctoresRepository, CitaService citaService) {
        this.doctoresRepository = doctoresRepository;
        this.citaService = citaService;
    }

    // GET /api/doctores -> Lista los médicos disponibles para el filtro lateral y calendario
    @GetMapping
    public ResponseEntity<List<DoctorResumenDTO>> getAll() {
        List<DoctorResumenDTO> doctores = doctoresRepository.findAll()
                .stream()
                .map(this::aResumenDTO)
                .toList();
        return ResponseEntity.ok(doctores);
    }

    // GET /api/doctores/{id} -> Consulta un médico por ID
    @GetMapping("/{id}")
    public ResponseEntity<DoctorResumenDTO> getById(@PathVariable Long id) {
        Doctores doctor = doctoresRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Doctor no encontrado"));
        return ResponseEntity.ok(aResumenDTO(doctor));
    }

    // GET /api/doctores/{id}/disponibilidad?fecha=2026-11-26
    // Devuelve los horarios disponibles y ocupados del médico en esa fecha
    @GetMapping("/{id}/disponibilidad")
    public ResponseEntity<List<SlotCalendarioDTO>> getDisponibilidad(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        LocalDate dia = (fecha != null) ? fecha : LocalDate.now();
        return ResponseEntity.ok(citaService.obtenerDisponibilidadPorFecha(id, dia));
    }

    @PostMapping
    public ResponseEntity<DoctorResumenDTO> create(@Valid @RequestBody Doctores doctores) {
        doctores.setIdDoctor(null);
        Doctores guardado = doctoresRepository.save(doctores);
        return ResponseEntity.status(HttpStatus.CREATED).body(aResumenDTO(guardado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorResumenDTO> update(@PathVariable Long id, @Valid @RequestBody Doctores doctores) {
        if (!doctoresRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Doctor no encontrado");
        }
        doctores.setIdDoctor(id);
        return ResponseEntity.ok(aResumenDTO(doctoresRepository.save(doctores)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!doctoresRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Doctor no encontrado");
        }
        doctoresRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private DoctorResumenDTO aResumenDTO(Doctores d) {
        SedeResumenDTO sedeDTO = null;
        if (d.getSede() != null) {
            sedeDTO = SedeResumenDTO.builder()
                    .idSede(d.getSede().getIdSede())
                    .direccionSede(d.getSede().getDireccionSede())
                    .telefono(d.getSede().getTelefono())
                    .build();
        }
        return DoctorResumenDTO.builder()
                .idDoctor(d.getIdDoctor())
                .nombreCompleto(d.getNombreCompleto())
                .especialidad(d.getEspecialidad() != null ? d.getEspecialidad() : "Medicina General")
                .consultorio(d.getConsultorio() != null ? d.getConsultorio() : "Consultorio 101")
                .correo(d.getCorreo())
                .sede(sedeDTO)
                .build();
    }
}
