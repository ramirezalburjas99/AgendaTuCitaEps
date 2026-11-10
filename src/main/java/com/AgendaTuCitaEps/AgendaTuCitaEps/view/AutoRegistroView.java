package com.AgendaTuCitaEps.AgendaTuCitaEps.view;

import com.AgendaTuCitaEps.AgendaTuCitaEps.model.Pacientes;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.PacientesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;


@Controller
//Controlador para la vista del formulario de registro
public class AutoRegistroView {
    @Autowired
    private PacientesRepository pacientesRepository;

    @GetMapping("/view/formulario")
    public String mostrarFormulario(Model model){
        model.addAttribute("pacientes", new Pacientes());
        return "/pacientes/formulario";}

//Registro y envio de datos + mensaje de registro exitoso
    @PostMapping("/view/autoregistro/save")
    public String save(@ModelAttribute("pacientes") Pacientes pacientes, RedirectAttributes ra){
        pacientesRepository.save(pacientes);
        ra.addFlashAttribute("success", "Tus datos se han registrado con exito");
        return "redirect:/inicio";
    }
}

