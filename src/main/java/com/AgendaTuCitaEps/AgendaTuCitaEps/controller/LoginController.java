package com.AgendaTuCitaEps.AgendaTuCitaEps.controller;

import com.AgendaTuCitaEps.AgendaTuCitaEps.model.Pacientes;
import com.AgendaTuCitaEps.AgendaTuCitaEps.repository.PacientesRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginController
{
    @GetMapping("/inicio")
    public String MostrarInicioSesion()
    {
        return "/login/index";
    }

    @Autowired
    private PacientesRepository pacientesRepository;

    @PostMapping("/login")
    public String procesarLogin(@RequestParam String correo, @RequestParam String contrasena, HttpSession session){
        Pacientes paciente = pacientesRepository.findByCorreoAndContrasena(correo, contrasena);

        if (paciente != null){
            session.setAttribute("usuarioLogueado", paciente);
            return "redirect:/home";
        }
        return "redirect:/inicio?error=true";
    }
    @GetMapping("/home")
    public String mostrarHome(HttpSession session, Model model){
        Pacientes paciente = (Pacientes) session.getAttribute("usuarioLogueado");

        if (paciente == null){
            return "redirect:/inicio";
        }
        model.addAttribute("pacientes", paciente);
        return "/homePage/home";
    }
}

