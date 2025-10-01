package com.example.jor_opgave1_kinoxp.controller;

import com.example.jor_opgave1_kinoxp.model.Movie;
import com.example.jor_opgave1_kinoxp.service.MovieService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private static final String CONFLICT_MSG = "Teatret er allerede booket af en anden film i den valgte periode.";

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping
    public List<Movie> getAllMovies() {
        return movieService.getAllMovies();
    }

    @GetMapping("/{id}")
    public Movie getMovie(@PathVariable Long id) {
        return movieService.getMovieById(id);
    }

    @PostMapping
    public ResponseEntity<?> createMovie(@RequestBody Movie movie) {
        try {
            Movie created = movieService.createMovie(movie);
            return ResponseEntity.ok(created);
        } catch (RuntimeException ex) {
            String msg = ex.getMessage() != null ? ex.getMessage() : "Fejl ved gemning af film";
            if (msg.contains("Teatret er allerede booket")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(CONFLICT_MSG);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(msg);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMovie(@PathVariable Long id, @RequestBody Movie movie) {
        try {
            Movie updated = movieService.updateMovie(id, movie);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            String msg = ex.getMessage() != null ? ex.getMessage() : "Fejl ved gemning af film";
            if (msg.contains("Teatret er allerede booket")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(CONFLICT_MSG);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(msg);
        }
    }

    @DeleteMapping("/{id}")
    public void deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
    }
}