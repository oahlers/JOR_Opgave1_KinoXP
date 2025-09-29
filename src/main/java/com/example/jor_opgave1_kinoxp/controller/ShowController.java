package com.example.jor_opgave1_kinoxp.controller;

import com.example.jor_opgave1_kinoxp.model.Show;
import com.example.jor_opgave1_kinoxp.service.ShowService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/shows")
public class ShowController {

    private final ShowService showService;

    public ShowController(ShowService showService) {
        this.showService = showService;
    }

    @GetMapping
    public List<Show> getAllShows() {
        return showService.getAllShows();
    }

    @GetMapping("/{id}")
    public Optional<Show> getShow(@PathVariable Long id) {
        return showService.getShowById(id);
    }

    @GetMapping("/between")
    public List<Show> getShowsBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return showService.findByShowTimeBetween(start, end);
    }

    @GetMapping("/movie/{movieId}")
    public List<Show> getShowsByMovie(@PathVariable Long movieId) {
        return showService.findByMovieId(movieId);
    }

    @GetMapping("/theater/{theaterId}")
    public List<Show> getShowsByTheater(@PathVariable Long theaterId) {
        return showService.findByTheaterId(theaterId);
    }

    @PostMapping
    public Show createShow(@RequestBody Show show) {
        return showService.createShow(show);
    }

    @PutMapping("/{id}")
    public Show updateShow(@PathVariable Long id, @RequestBody Show show) {
        return showService.updateShow(id, show);
    }

    @PutMapping("/{id}/movie/{movieId}")
    public Show setMovie(@PathVariable Long id, @PathVariable Long movieId) {
        return showService.setMovie(id, movieId);
    }

    @PutMapping("/{id}/theater/{theaterId}")
    public Show setTheater(@PathVariable Long id, @PathVariable Long theaterId) {
        return showService.setTheater(id, theaterId);
    }

    @DeleteMapping("/{id}")
    public void deleteShow(@PathVariable Long id) {
        showService.deleteShow(id);
    }
}