package com.AgendaTuCitaEps.AgendaTuCitaEps.view;

import com.AgendaTuCitaEps.AgendaTuCitaEps.model.Sede;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.SedeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class SedeView
{
    @Autowired
    private SedeRepository sedeRepository;

    @GetMapping("/view/sede")
    public String lista(Model model)
    {
        model.addAttribute("sede", sedeRepository.findAll());
        return "sede/list";
    }

    @GetMapping("/view/sede/form")
    public String form(Model model)
    {
        model.addAttribute("sede", new Sede());
        return "sede/form";
    }

    @PostMapping("/view/sede/save")
    public String save(@ModelAttribute Sede sede, RedirectAttributes ra)
    {
        sedeRepository.save(sede);
        ra.addFlashAttribute("success", "Sede creada con exito");
        return "redirect:/view/sede";
    }

    @GetMapping("/view/sede/update/{id}")
    public String update(@PathVariable Long id, Model model)
    {
        Sede sede = sedeRepository.findById(id).orElse(null);
        model.addAttribute("sede", sede);
        return "sede/form";
    }

    @PostMapping("/view/sede/delete/{id}")
    public String delete(@PathVariable Long id, RedirectAttributes ra)
    {
        sedeRepository.deleteById(id);
        ra.addFlashAttribute("success", "Sede eliminada con exito");
        return "redirect:/view/sede";
    }
}