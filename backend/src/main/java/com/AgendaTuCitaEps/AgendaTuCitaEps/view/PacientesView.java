package com.AgendaTuCitaEps.AgendaTuCitaEps.view;

import com.AgendaTuCitaEps.AgendaTuCitaEps.model.Pacientes;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.PacientesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class PacientesView
{
    @Autowired
    private PacientesRepository pacientesRepository;

    @GetMapping ("/view/pacientes")
    public String lista(Model model)
    {
        model.addAttribute("pacientes", pacientesRepository.findAll());
        return "pacientes/list";
    }

    @GetMapping("/view/pacientes/form")
    public String form(Model model)
    {
        model.addAttribute("pacientes", new Pacientes());
        return "pacientes/form";
    }

    // Creación de Datos

    @PostMapping("/view/pacientes/save")
    public String save(@ModelAttribute Pacientes pacientes, RedirectAttributes ra)
    {
        pacientesRepository.save(pacientes);
        ra.addFlashAttribute("success", "Paciente creado con exito");
        return "redirect:/view/pacientes";
    }

    @GetMapping("view/pacientes/update/{id}")
    public String update(@PathVariable Long id, Model model)
    {
        Pacientes pacientes = pacientesRepository.findById(id).orElse(null);
        model.addAttribute("pacientes", pacientes);
        return "pacientes/form";
    }

    @PostMapping("/view/pacientes/delete/{id}")
    public String delete(@PathVariable Long id, RedirectAttributes ra)
    {
        pacientesRepository.deleteById(id);
        ra.addAttribute("message","Paciente eliminado con exito");
        return "redirect:/view/pacientes";
    }
}
