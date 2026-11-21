package com.AgendaTuCitaEps.AgendaTuCitaEps.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MantenimientoController {

    @GetMapping ("/mantenimiento")
    public String MostrarMantenimiento() {return "/mantenimiento/mantenimiento";}
}
