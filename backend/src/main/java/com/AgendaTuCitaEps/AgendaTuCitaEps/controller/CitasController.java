package com.AgendaTuCitaEps.AgendaTuCitaEps.controller;

import com.AgendaTuCitaEps.AgendaTuCitaEps.dto.*;
import com.AgendaTuCitaEps.AgendaTuCitaEps.model.*;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.CitasRepository;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.DoctoresRepository;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.PacientesRepository;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.SedeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citas")
    public class CitasController
    {
        @Autowired
        private CitasRepository citasRepository;

        @Autowired
        private DoctoresRepository doctoresRepository;

        @Autowired
        private PacientesRepository pacientesRepository;

        @Autowired
        private SedeRepository sedeRepository;

        @GetMapping
        public List<CitaResponseDTO> getAll()
        {
            return citasRepository.findAll()
                    .stream()
                    .map(this::convertirADTO)
                    .toList();
        }

        @GetMapping("/{id}")
        public CitaResponseDTO getById(@PathVariable Long id)
        {
            Citas cita = citasRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
            return convertirADTO(cita);
        }

        @PostMapping
        public CitaResponseDTO create(@RequestBody CitaRequestDTO dto)
        {
            Doctores doctor = doctoresRepository.findById(dto.getIdDoctor())
                    .orElseThrow(() -> new RuntimeException("Doctor no encontrado"));

            Pacientes paciente = pacientesRepository.findById(dto.getIdPaciente())
                    .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

            Sede sede = sedeRepository.findById(dto.getIdSede())
                    .orElseThrow(() -> new RuntimeException("Sede no encontrada"));

            Citas cita = Citas.builder()
                    .doctor(doctor)
                    .paciente(paciente)
                    .sede(sede)
                    .fechaHora(dto.getFechaHora())
                    .estado(EstadoCita.CONFIRMADA)
                    .build();

            Citas citaGuardada = citasRepository.save(cita);
            return convertirADTO(citaGuardada);
        }

        @PatchMapping("/{id}/cancelar")
        public CitaResponseDTO cancelar(@PathVariable Long id)
        {
            Citas cita = citasRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

            cita.setEstado(EstadoCita.CANCELADA);
            Citas citaActualizada = citasRepository.save(cita);
            return convertirADTO(citaActualizada);
        }

        @DeleteMapping("/{id}")
        public void delete(@PathVariable Long id)
        {
            citasRepository.deleteById(id);
        }

        private CitaResponseDTO convertirADTO(Citas cita)
        {
            DoctorResumenDTO doctorDTO= DoctorResumenDTO.builder()
                    .idDoctor(cita.getDoctor().getIdDoctor())
                    .nombreCompleto(cita.getDoctor().getNombreCompleto())
                    .correo(cita.getDoctor().getCorreo())
                    .build();

            PacientesResumenDTO pacienteDTO = PacientesResumenDTO.builder()
                    .idPaciente(cita.getPaciente().getIdPaciente())
                    .nombreCompleto(cita.getPaciente().getNombreCompleto())
                    .correo(cita.getPaciente().getCorreo())
                    .build();

            SedeResumenDTO sedeDTO = SedeResumenDTO.builder()
                    .idSede(cita.getSede().getIdSede())
                    .direccionSede(cita.getSede().getDireccionSede())
                    .telefono(cita.getSede().getTelefono())
                    .build();

            return CitaResponseDTO.builder()
                    .idCita(cita.getIdCita())
                    .doctor(doctorDTO)
                    .paciente(pacienteDTO)
                    .sede(sedeDTO)
                    .fechaHora(cita.getFechaHora())
                    .estado(cita.getEstado())
                    .build();
        }

}
