package com.example.jor_opgave1_kinoxp.repository;

import com.example.jor_opgave1_kinoxp.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieRepository extends JpaRepository<Movie, Long> {
}