package com.example.jor_opgave1_kinoxp.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "movie")
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String category;
    private int ageLimit;
    private String actors;
    private int duration; // in minutes

    private LocalDate firstShowDate;
    private int showDays;
    private Long theaterId;

    // Getters og setters...
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getAgeLimit() {
        return ageLimit;
    }

    public void setAgeLimit(int ageLimit) {
        this.ageLimit = ageLimit;
    }

    public String getActors() {
        return actors;
    }

    public void setActors(String actors) {
        this.actors = actors;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public LocalDate getFirstShowDate() {
        return firstShowDate;
    }

    public void setFirstShowDate(LocalDate firstShowDate) {
        this.firstShowDate = firstShowDate;
    }

    public int getShowDays() {
        return showDays;
    }

    public void setShowDays(int showDays) {
        this.showDays = showDays;
    }

    public Long getTheaterId() {
        return theaterId;
    }

    public void setTheaterId(Long theaterId) {
        this.theaterId = theaterId;
    }
}