package com.example.jor_opgave1_kinoxp.repository;


import com.example.jor_opgave1_kinoxp.model.Show;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ShowRepository extends JpaRepository<Show, Long> {
    List<Show> findByShowTimeBetween(LocalDateTime start, LocalDateTime end);
}