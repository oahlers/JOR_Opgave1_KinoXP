package com.example.jor_opgave1_kinoxp.controller;

import com.example.jor_opgave1_kinoxp.model.Show;
import com.example.jor_opgave1_kinoxp.service.ShowService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

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
    public Show getShow(@PathVariable Long id) {
        return showService.getShowById(id);
    }

    @GetMapping("/range")
    public List<Show> getShowsInRange(@RequestParam String start,
                                      @RequestParam String end) {
        return showService.getShowsInRange(
                LocalDateTime.parse(start), LocalDateTime.parse(end));
    }

    @PostMapping
    public Show createShow(@RequestParam Long movieId,
                           @RequestParam Long theaterId,
                           @RequestParam String dateTime) {
        return showService.createShow(movieId, theaterId, LocalDateTime.parse(dateTime));
    }

    @PutMapping("/{id}")
    public Show updateShow(@PathVariable Long id,
                           @RequestParam Long movieId,
                           @RequestParam Long theaterId,
                           @RequestParam String dateTime) {
        return showService.updateShow(id, movieId, theaterId, LocalDateTime.parse(dateTime));
    }

    @DeleteMapping("/{id}")
    public void deleteShow(@PathVariable Long id) {
        showService.deleteShow(id);
    }
}
