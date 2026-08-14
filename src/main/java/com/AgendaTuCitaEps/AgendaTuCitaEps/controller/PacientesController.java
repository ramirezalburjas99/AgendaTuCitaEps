package com.AgendaTuCitaEps.AgendaTuCitaEps.controller;

import com.AgendaTuCitaEps.AgendaTuCitaEps.model.Pacientes;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.PacientesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
public class PacientesController
{
    @Autowired
    private PacientesRepository pacientesRepository;

    @GetMapping
    public List<Pacientes> getAll()
    {
        return pacientesRepository.findAll();
    }

    @GetMapping("/{id}")
    public Pacientes getById(@PathVariable Long id)
    {
        return pacientesRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Pacientes create(@RequestBody Pacientes pacientes)
    {
        return pacientesRepository.save(pacientes);
    }

    @PutMapping("/{id}")
    public Pacientes update(@PathVariable Long id, @RequestBody Pacientes pacientes)
    {
        pacientes.setIdPaciente(id);
        return pacientesRepository.save(pacientes);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id)
    {
        pacientesRepository.deleteById(id);
    }
}
