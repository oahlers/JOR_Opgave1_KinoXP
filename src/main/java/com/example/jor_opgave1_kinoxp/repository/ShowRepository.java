package com.example.jor_opgave1_kinoxp.repository;

import com.example.jor_opgave1_kinoxp.model.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ShowRepository extends JpaRepository<Show, Long> {

    // Find shows for en specifik film
    List<Show> findByMovieId(Long movieId);

    // Find shows for et specifikt teater
    List<Show> findByTheaterId(Long theaterId);

    // Find shows mellem to datoer
    List<Show> findByShowTimeBetween(LocalDateTime start, LocalDateTime end);

    // Find shows for et specifikt teater på et specifikt tidspunkt
    @Query("SELECT s FROM Show s WHERE s.theaterId = :theaterId AND s.showTime = :showTime")
    List<Show> findByTheaterIdAndShowTime(@Param("theaterId") Long theaterId, @Param("showTime") LocalDateTime showTime);

    // Find shows for en film mellem to datoer
    @Query("SELECT s FROM Show s WHERE s.movieId = :movieId AND s.showTime BETWEEN :start AND :end")
    List<Show> findByMovieIdAndShowTimeBetween(@Param("movieId") Long movieId,
                                               @Param("start") LocalDateTime start,
                                               @Param("end") LocalDateTime end);

    // Slet alle shows for en film
    @Modifying
    @Query("DELETE FROM Show s WHERE s.movieId = :movieId")
    void deleteByMovieId(@Param("movieId") Long movieId);

    // Find shows med movie og theater data (eager loading)
    @Query("SELECT s FROM Show s JOIN FETCH s.movie JOIN FETCH s.theater WHERE s.showTime BETWEEN :start AND :end")
    List<Show> findShowsWithDetailsBetween(@Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);
}