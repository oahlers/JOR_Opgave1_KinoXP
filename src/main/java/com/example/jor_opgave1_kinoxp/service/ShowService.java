package com.example.jor_opgave1_kinoxp.service;

import com.example.jor_opgave1_kinoxp.model.Show;
import com.example.jor_opgave1_kinoxp.repository.ShowRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ShowService {

    private final ShowRepository showRepository;

    public ShowService(ShowRepository showRepository) {
        this.showRepository = showRepository;
    }

    // Find alle shows
    public List<Show> getAllShows() {
        return showRepository.findAll();
    }

    // Find show by ID
    public Optional<Show> getShowById(Long id) {
        return showRepository.findById(id);
    }

    // Find shows mellem to datoer
    public List<Show> findByShowTimeBetween(LocalDateTime start, LocalDateTime end) {
        return showRepository.findByShowTimeBetween(start, end);
    }

    // Find shows for en specifik film
    public List<Show> findByMovieId(Long movieId) {
        return showRepository.findByMovieId(movieId);
    }

    // Find shows for et specifikt teater
    public List<Show> findByTheaterId(Long theaterId) {
        return showRepository.findByTheaterId(theaterId);
    }

    // Opret nyt show
    public Show createShow(Show show) {
        return showRepository.save(show);
    }

    // Opdater eksisterende show
    public Show updateShow(Long id, Show updatedShow) {
        Show show = showRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Show ikke fundet med id: " + id));

        show.setMovieId(updatedShow.getMovieId());
        show.setTheaterId(updatedShow.getTheaterId());
        show.setShowTime(updatedShow.getShowTime());

        return showRepository.save(show);
    }

    // Slet show
    public void deleteShow(Long id) {
        showRepository.deleteById(id);
    }

    // Set movie på et show
    public Show setMovie(Long showId, Long movieId) {
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new RuntimeException("Show ikke fundet med id: " + showId));
        show.setMovieId(movieId);
        return showRepository.save(show);
    }

    // Set theater på et show
    public Show setTheater(Long showId, Long theaterId) {
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new RuntimeException("Show ikke fundet med id: " + showId));
        show.setTheaterId(theaterId);
        return showRepository.save(show);
    }

    // Tjek om teater er tilgængeligt på et givent tidspunkt
    public boolean isTheaterAvailable(Long theaterId, LocalDateTime showTime, Long excludeShowId) {
        // Find alle shows for dette teater på samme tid
        List<Show> conflictingShows = showRepository.findByTheaterIdAndShowTime(theaterId, showTime);

        // Filtrer ud excludeShowId hvis det er en opdatering
        if (excludeShowId != null) {
            conflictingShows.removeIf(show -> show.getId().equals(excludeShowId));
        }

        return conflictingShows.isEmpty();
    }
}