package com.example.jor_opgave1_kinoxp.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Theater {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int rows;
    private int seatsPerRow;

    @OneToMany(mappedBy = "theater")
    private List<Show> shows;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getRows() {
        return rows;
    }

    public int getSeatsPerRow() {
        return seatsPerRow;
    }

    public List<Show> getShows() {
        return shows;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setRows(int rows) {
        this.rows = rows;
    }

    public void setSeatsPerRow(int seatsPerRow) {
        this.seatsPerRow = seatsPerRow;
    }

    public void setShows(List<Show> shows) {
        this.shows = shows;
    }
}