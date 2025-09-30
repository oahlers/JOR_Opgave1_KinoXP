package com.example.jor_opgave1_kinoxp.repository;

import com.example.jor_opgave1_kinoxp.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerName(String customerName);

    @Query("select coalesce(sum(b.seats),0) from Booking b where b.show.movieId = :movieId and b.show.showTime between :start and :end")
    Integer sumSeatsByMovieAndShowTimeBetween(@Param("movieId") Long movieId,
                                              @Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);
}