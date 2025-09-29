package com.example.jor_opgave1_kinoxp.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Roster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "staff_id")
    private Staff staff;

    private LocalDate workDate;
    private String shift;

    public Long getId() {
        return id;
    }

    public Staff getStaff() {
        return staff;
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public String getShift() {
        return shift;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setStaff(Staff staff) {
        this.staff = staff;
    }

    public void setWorkDate(LocalDate workDate) {
        this.workDate = workDate;
    }

    public void setShift(String shift) {
        this.shift = shift;
    }
}