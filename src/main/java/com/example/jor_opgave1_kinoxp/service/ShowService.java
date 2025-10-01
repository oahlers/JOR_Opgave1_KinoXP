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

    public List<Show> getAllShows() {
        return showRepository.findAll();
    }

    public Optional<Show> getShowById(Long id) {
        return showRepository.findById(id);
    }

    public List<Show> findByShowTimeBetween(LocalDateTime start, LocalDateTime end) {
        return showRepository.findByShowTimeBetween(start, end);
    }

    public List<Show> findWithDetailsBetween(LocalDateTime start, LocalDateTime end) {
        return showRepository.findShowsWithDetailsBetween(start, end);
    }

    public List<Show> findByMovieId(Long movieId) {
        return showRepository.findByMovieId(movieId);
    }

    public List<Show> findByTheaterId(Long theaterId) {
        return showRepository.findByTheaterId(theaterId);
    }

    public Show createShow(Show show) {
        if (show.getTheaterId() != null && show.getShowTime() != null && show.getMovieId() != null) {
            LocalDateTime startOfDay = show.getShowTime().toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = show.getShowTime().toLocalDate().atTime(23,59,59,999000000);
            List<Show> conflicts = showRepository.findConflictsForTheaterAndDate(show.getTheaterId(), startOfDay, endOfDay, show.getMovieId());
            if (!conflicts.isEmpty()) {
                throw new RuntimeException("Teatret er allerede booket til en anden film på denne dato.");
            }
        }
        return showRepository.save(show);
    }

    public Show updateShow(Long id, Show updatedShow) {
        Show show = showRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Show ikke fundet med id: " + id));

        Long targetMovieId = updatedShow.getMovieId();
        Long targetTheaterId = updatedShow.getTheaterId();
        LocalDateTime targetShowTime = updatedShow.getShowTime();

        if (targetTheaterId != null && targetShowTime != null && targetMovieId != null) {
            LocalDateTime startOfDay = targetShowTime.toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = targetShowTime.toLocalDate().atTime(23,59,59,999000000);
            List<Show> conflicts = showRepository.findConflictsForTheaterAndDate(targetTheaterId, startOfDay, endOfDay, targetMovieId);
            conflicts.removeIf(s -> s.getId().equals(id));
            if (!conflicts.isEmpty()) {
                throw new RuntimeException("Teatret er allerede booket til en anden film på denne dato.");
            }
        }

        show.setMovieId(targetMovieId);
        show.setTheaterId(targetTheaterId);
        show.setShowTime(targetShowTime);

        return showRepository.save(show);
    }

    public void deleteShow(Long id) {
        showRepository.deleteById(id);
    }

    public Show setMovie(Long showId, Long movieId) {
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new RuntimeException("Show ikke fundet med id: " + showId));
        show.setMovieId(movieId);
        return showRepository.save(show);
    }

    public Show setTheater(Long showId, Long theaterId) {
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new RuntimeException("Show ikke fundet med id: " + showId));
        show.setTheaterId(theaterId);
        return showRepository.save(show);
    }

    public boolean isTheaterAvailable(Long theaterId, LocalDateTime showTime, Long excludeShowId) {
        List<Show> conflictingShows = showRepository.findByTheaterIdAndShowTime(theaterId, showTime);
        if (excludeShowId != null) {
            conflictingShows.removeIf(show -> show.getId().equals(excludeShowId));
        }
        return conflictingShows.isEmpty();
    }
}