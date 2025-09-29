package com.example.jor_opgave1_kinoxp.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String category;
    private int ageLimit;
    private String actors;
    private int duration; // minutes

    @OneToMany(mappedBy = "movie")
    private List<Show> shows;

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getCategory() {
        return category;
    }

    public int getAgeLimit() {
        return ageLimit;
    }

    public String getActors() {
        return actors;
    }

    public int getDuration() {
        return duration;
    }

    public List<Show> getShows() {
        return shows;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setAgeLimit(int ageLimit) {
        this.ageLimit = ageLimit;
    }

    public void setActors(String actors) {
        this.actors = actors;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public void setShows(List<Show> shows) {
        this.shows = shows;
    }
}
