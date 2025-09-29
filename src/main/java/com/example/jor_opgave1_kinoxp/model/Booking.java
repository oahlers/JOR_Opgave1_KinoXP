package com.example.jor_opgave1_kinoxp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "show_id")
    private Show show;

    private String customerName;
    private int seats;
    private LocalDateTime bookingTime;

    public Long getId() {
        return id;
    }

    public Show getShow() {
        return show;
    }

    public String getCustomerName() {
        return customerName;
    }

    public int getSeats() {
        return seats;
    }

    public LocalDateTime getBookingTime() {
        return bookingTime;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setShow(Show show) {
        this.show = show;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public void setSeats(int seats) {
        this.seats = seats;
    }

    public void setBookingTime(LocalDateTime bookingTime) {
        this.bookingTime = bookingTime;
    }
}