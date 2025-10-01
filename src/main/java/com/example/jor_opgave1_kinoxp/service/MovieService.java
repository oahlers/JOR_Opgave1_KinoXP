package com.example.jor_opgave1_kinoxp.service;

import com.example.jor_opgave1_kinoxp.model.Movie;
import com.example.jor_opgave1_kinoxp.model.Show;
import com.example.jor_opgave1_kinoxp.repository.MovieRepository;
import com.example.jor_opgave1_kinoxp.repository.ShowRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final ShowRepository showRepository;

    public MovieService(MovieRepository movieRepository, ShowRepository showRepository) {
        this.movieRepository = movieRepository;
        this.showRepository = showRepository;
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Movie getMovieById(Long id) {
        return movieRepository.findById(id).orElseThrow(() -> new RuntimeException("Movie not found with id: " + id));
    }

    @Transactional
    public Movie createMovie(Movie movie) {
        Movie savedMovie = movieRepository.save(movie);

        if (movie.getFirstShowDate() != null && movie.getShowDays() > 0 && movie.getTheaterId() != null) {
            LocalDate start = movie.getFirstShowDate();
            LocalDate end = start.plusDays(movie.getShowDays() - 1);
            LocalDateTime startDateTime = start.atStartOfDay();
            LocalDateTime endDateTime = end.atTime(23, 59, 59, 999_000_000);
            Long conflicts = showRepository.countConflictsForTheaterBetweenExcludingMovie(movie.getTheaterId(), startDateTime, endDateTime, savedMovie.getId());
            if (conflicts != null && conflicts > 0) {
                throw new RuntimeException("Teatret er allerede booket af en anden film i den valgte periode.");
            }
            generateShowsForMovie(savedMovie);
        }

        return savedMovie;
    }

    @Transactional
    public Movie updateMovie(Long id, Movie updatedMovie) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + id));

        movie.setTitle(updatedMovie.getTitle());
        movie.setCategory(updatedMovie.getCategory());
        movie.setAgeLimit(updatedMovie.getAgeLimit());
        movie.setActors(updatedMovie.getActors());
        movie.setDuration(updatedMovie.getDuration());
        movie.setFirstShowDate(updatedMovie.getFirstShowDate());
        movie.setShowDays(updatedMovie.getShowDays());
        movie.setTheaterId(updatedMovie.getTheaterId());
        movie.setTicketPrice(updatedMovie.getTicketPrice());
        movie.setImageUrl(updatedMovie.getImageUrl());

        if (updatedMovie.getFirstShowDate() != null && updatedMovie.getShowDays() > 0 && updatedMovie.getTheaterId() != null) {
            LocalDate start = updatedMovie.getFirstShowDate();
            LocalDate end = start.plusDays(updatedMovie.getShowDays() - 1);
            LocalDateTime startDateTime = start.atStartOfDay();
            LocalDateTime endDateTime = end.atTime(23, 59, 59, 999_000_000);
            Long conflicts = showRepository.countConflictsForTheaterBetweenExcludingMovie(updatedMovie.getTheaterId(), startDateTime, endDateTime, id);
            if (conflicts != null && conflicts > 0) {
                throw new RuntimeException("Teatret er allerede booket af en anden film i den valgte periode.");
            }
            showRepository.deleteByMovieId(id);
            generateShowsForMovie(movie);
        }

        return movieRepository.save(movie);
    }

    @Transactional
    public void deleteMovie(Long id) {
        showRepository.deleteByMovieId(id);
        movieRepository.deleteById(id);
    }

    private void generateShowsForMovie(Movie movie) {
        LocalDate currentDate = movie.getFirstShowDate();
        LocalDate endDate = currentDate.plusDays(movie.getShowDays() - 1);

        System.out.println("Generating shows for movie: " + movie.getTitle());
        System.out.println("From: " + currentDate + " to: " + endDate);
        System.out.println("Theater: " + movie.getTheaterId());

        LocalTime[] showTimes = {
                LocalTime.of(14, 0),
                LocalTime.of(17, 0),
                LocalTime.of(20, 0)
        };

        int showCount = 0;

        while (!currentDate.isAfter(endDate)) {
            for (LocalTime showTime : showTimes) {
                LocalDateTime showDateTime = LocalDateTime.of(currentDate, showTime);

                Show show = new Show();
                show.setMovieId(movie.getId());
                show.setTheaterId(movie.getTheaterId());
                show.setShowTime(showDateTime);

                showRepository.save(show);
                showCount++;

                System.out.println("Created show: " + showDateTime + " for theater " + movie.getTheaterId());
            }
            currentDate = currentDate.plusDays(1);
        }

        System.out.println("Total shows created: " + showCount);
    }
}