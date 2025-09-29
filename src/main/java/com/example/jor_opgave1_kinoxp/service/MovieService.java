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
        return movieRepository.findById(id).orElseThrow();
    }

    @Transactional
    public Movie createMovie(Movie movie) {
        Movie savedMovie = movieRepository.save(movie);

        // Generer shows hvis firstShowDate og showDays er sat
        if (movie.getFirstShowDate() != null && movie.getShowDays() > 0) {
            generateShowsForMovie(savedMovie);
        }

        return savedMovie;
    }

    @Transactional
    public Movie updateMovie(Long id, Movie updatedMovie) {
        Movie movie = movieRepository.findById(id).orElseThrow();
        movie.setTitle(updatedMovie.getTitle());
        movie.setCategory(updatedMovie.getCategory());
        movie.setAgeLimit(updatedMovie.getAgeLimit());
        movie.setActors(updatedMovie.getActors());
        movie.setDuration(updatedMovie.getDuration());
        movie.setFirstShowDate(updatedMovie.getFirstShowDate());
        movie.setShowDays(updatedMovie.getShowDays());
        movie.setTheaterId(updatedMovie.getTheaterId());

        // Slet eksisterende shows og generer nye
        if (updatedMovie.getFirstShowDate() != null && updatedMovie.getShowDays() > 0) {
            showRepository.deleteByMovieId(id);
            generateShowsForMovie(movie);
        }

        return movieRepository.save(movie);
    }

    public void deleteMovie(Long id) {
        // Slet først alle tilknyttede shows
        showRepository.deleteByMovieId(id);
        // Slet derefter filmen
        movieRepository.deleteById(id);
    }

    private void generateShowsForMovie(Movie movie) {
        LocalDate currentDate = movie.getFirstShowDate();
        LocalDate endDate = currentDate.plusDays(movie.getShowDays());

        // Standard show-tider
        LocalTime[] showTimes = {
                LocalTime.of(14, 0),  // 14:00
                LocalTime.of(17, 0),  // 17:00
                LocalTime.of(20, 0),  // 20:00
                LocalTime.of(23, 0)   // 23:00 (kun for voksne film)
        };

        while (!currentDate.isAfter(endDate)) {
            for (LocalTime showTime : showTimes) {
                // Skip late shows for børnefilm
                if (showTime.equals(LocalTime.of(23, 0)) && movie.getAgeLimit() < 15) {
                    continue;
                }

                LocalDateTime showDateTime = LocalDateTime.of(currentDate, showTime);

                Show show = new Show();
                show.setMovieId(movie.getId());
                show.setTheaterId(movie.getTheaterId());
                show.setShowTime(showDateTime);

                showRepository.save(show);
            }
            currentDate = currentDate.plusDays(1);
        }
    }
}