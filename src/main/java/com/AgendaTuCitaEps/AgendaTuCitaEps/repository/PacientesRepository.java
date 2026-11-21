package com.AgendaTuCitaEps.AgendaTuCitaEps.repository;

import com.AgendaTuCitaEps.AgendaTuCitaEps.model.Pacientes;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PacientesRepository extends JpaRepository<Pacientes,Long>
{
    Pacientes findByCorreoAndContrasena(String correo, String contrasena);

    // Spring Data solo consulta a partir del nombre del metodo
    // asi se evita que dos pacientes tengan el mismo correo.

    boolean existsByCorreo(String correo);
}
