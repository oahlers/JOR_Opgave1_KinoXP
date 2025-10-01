package com.example.jor_opgave1_kinoxp.repository;

import com.example.jor_opgave1_kinoxp.model.BookingSweet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingSweetRepository extends JpaRepository<BookingSweet, Long> {
    List<BookingSweet> findByBookingId(Long bookingId);
}
