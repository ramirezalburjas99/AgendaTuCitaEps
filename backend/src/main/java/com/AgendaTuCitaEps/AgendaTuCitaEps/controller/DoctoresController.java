package com.AgendaTuCitaEps.AgendaTuCitaEps.controller;

import com.AgendaTuCitaEps.AgendaTuCitaEps.model.Doctores;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.DoctoresRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctores")
public class DoctoresController
{
    @Autowired
    private DoctoresRepository doctoresRepository;

    @GetMapping
    public List<Doctores> getAll()
    {
        return doctoresRepository.findAll();
    }

    @GetMapping("/{id}")
    public Doctores getById(@PathVariable Long id)
    {
        return doctoresRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Doctores create(@RequestBody Doctores doctores)
    {
        return doctoresRepository.save(doctores);
    }

    @PutMapping("/{id}")
    public Doctores update(@PathVariable Long id, @RequestBody Doctores doctores)
    {
        doctores.setIdDoctor(id);
        return doctoresRepository.save(doctores);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id)
    {
        doctoresRepository.deleteById(id);
    }
}
