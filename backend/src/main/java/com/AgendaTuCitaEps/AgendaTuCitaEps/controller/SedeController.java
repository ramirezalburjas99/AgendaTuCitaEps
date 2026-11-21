package com.AgendaTuCitaEps.AgendaTuCitaEps.controller;

import com.AgendaTuCitaEps.AgendaTuCitaEps.model.Sede;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.SedeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sede")
public class SedeController
{

    @Autowired
    private SedeRepository sedeRepository;

    @GetMapping
    public List<Sede> getAll()
    {
        return sedeRepository.findAll();
    }

    @GetMapping("/{id}")
    public Sede getById(@PathVariable Long id)
    {
        return sedeRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Sede create(@RequestBody Sede sede)
    {
        return sedeRepository.save(sede);
    }

    @PutMapping("/{id}")
    public Sede update(@PathVariable Long id, @RequestBody Sede sede)
    {
        sede.setIdSede(id);
        return sedeRepository.save(sede);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id)
    {
        sedeRepository.deleteById(id);
    }
}
