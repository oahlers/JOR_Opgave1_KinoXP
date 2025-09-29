package com.example.jor_opgave1_kinoxp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Show {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @ManyToOne
    @JoinColumn(name = "theater_id")
    private Theater theater;

    private LocalDateTime showTime;

    @OneToMany(mappedBy = "show")
    private List<Booking> bookings;

    public Long getId() {
        return id;
    }

    public Movie getMovie() {
        return movie;
    }

    public Theater getTheater() {
        return theater;
    }

    public LocalDateTime getShowTime() {
        return showTime;
    }

    public List<Booking> getBookings() {
        return bookings;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public void setTheater(Theater theater) {
        this.theater = theater;
    }

    public void setShowTime(LocalDateTime showTime) {
        this.showTime = showTime;
    }

    public void setBookings(List<Booking> bookings) {
        this.bookings = bookings;
    }
}