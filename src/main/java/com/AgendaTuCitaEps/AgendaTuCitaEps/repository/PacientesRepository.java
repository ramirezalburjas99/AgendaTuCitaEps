package com.AgendaTuCitaEps.AgendaTuCitaEps.repository;

import com.AgendaTuCitaEps.AgendaTuCitaEps.model.Pacientes;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PacientesRepository extends JpaRepository<Pacientes,Long>
{
    Pacientes findByCorreoAndContrasena(String correo, String contrasena);
}
