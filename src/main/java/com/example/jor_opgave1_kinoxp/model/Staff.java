package com.example.jor_opgave1_kinoxp.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String role;

    @OneToMany(mappedBy = "staff")
    private List<Roster> rosterEntries;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }

    public List<Roster> getRosterEntries() {
        return rosterEntries;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setRosterEntries(List<Roster> rosterEntries) {
        this.rosterEntries = rosterEntries;
    }
}