package com.AgendaTuCitaEps.AgendaTuCitaEps.repository;

import com.AgendaTuCitaEps.AgendaTuCitaEps.model.Citas;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CitasRepository extends JpaRepository<Citas, Long>
{
}
