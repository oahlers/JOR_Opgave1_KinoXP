package com.example.jor_opgave1_kinoxp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "booking_sweets")
public class BookingSweet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sweet_id")
    private Sweet sweet;

    private int quantity = 1;

    @Column(name = "price_each", nullable = false)
    private BigDecimal priceEach;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public Sweet getSweet() {
        return sweet;
    }

    public void setSweet(Sweet sweet) {
        this.sweet = sweet;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPriceEach() {
        return priceEach;
    }

    public void setPriceEach(BigDecimal priceEach) {
        this.priceEach = priceEach;
    }
}
