package com.AgendaTuCitaEps.AgendaTuCitaEps.view;

import com.AgendaTuCitaEps.AgendaTuCitaEps.model.Doctores;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.DoctoresRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class DoctoresView
{
    @Autowired
    private DoctoresRepository doctoresRepository;

    @GetMapping ("/view/doctores")
    public String lista(Model model)
    {
        model.addAttribute("doctores", doctoresRepository.findAll());
        return "doctores/list";
    }

    @GetMapping ("/view/doctores/form")
    public String form(Model model)
    {
        model.addAttribute("doctores", new Doctores());
        return "doctores/form";
    }

    @PostMapping ("/view/doctores/save")
    public String save(@ModelAttribute Doctores doctores, RedirectAttributes ra)
    {
        doctoresRepository.save(doctores);
        ra.addFlashAttribute("success","Doctor creado con exito");
        return "redirect:/view/doctores";
    }

    @GetMapping ("view/doctores/update/{id}")
    public String update (@PathVariable Long id, Model model)
    {
        Doctores doctores = doctoresRepository.findById(id).orElse(null);
        model.addAttribute("doctores", doctores);
        return "doctores/form";
    }

    @PostMapping("/view/doctores/delete/{id}")
    public String delete (@PathVariable Long id, RedirectAttributes ra)
    {
        doctoresRepository.deleteById(id);
        ra.addFlashAttribute("success", "Doctor eliminado con exito");
        return "redirect:/view/doctores";
    }
}
