package com.example.jor_opgave1_kinoxp.service;

import com.example.jor_opgave1_kinoxp.model.Show;
import com.example.jor_opgave1_kinoxp.model.Movie;
import com.example.jor_opgave1_kinoxp.model.Theater;
import com.example.jor_opgave1_kinoxp.repository.ShowRepository;
import com.example.jor_opgave1_kinoxp.repository.MovieRepository;
import com.example.jor_opgave1_kinoxp.repository.TheaterRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShowService {

    private final ShowRepository showRepository;
    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;

    public ShowService(ShowRepository showRepository, MovieRepository movieRepository, TheaterRepository theaterRepository) {
        this.showRepository = showRepository;
        this.movieRepository = movieRepository;
        this.theaterRepository = theaterRepository;
    }

    public List<Show> getAllShows() {
        return showRepository.findAll();
    }

    public Show getShowById(Long id) {
        return showRepository.findById(id).orElseThrow();
    }

    public List<Show> getShowsInRange(LocalDateTime start, LocalDateTime end) {
        return showRepository.findByShowTimeBetween(start, end);
    }

    public Show createShow(Long movieId, Long theaterId, LocalDateTime dateTime) {
        Movie movie = movieRepository.findById(movieId).orElseThrow();
        Theater theater = theaterRepository.findById(theaterId).orElseThrow();

        Show show = new Show();
        show.setMovie(movie);
        show.setTheater(theater);
        show.setShowTime(dateTime);

        return showRepository.save(show);
    }

    public Show updateShow(Long id, Long movieId, Long theaterId, LocalDateTime dateTime) {
        Show show = showRepository.findById(id).orElseThrow();
        Movie movie = movieRepository.findById(movieId).orElseThrow();
        Theater theater = theaterRepository.findById(theaterId).orElseThrow();

        show.setMovie(movie);
        show.setTheater(theater);
        show.setShowTime(dateTime);

        return showRepository.save(show);
    }

    public void deleteShow(Long id) {
        showRepository.deleteById(id);
    }
}
