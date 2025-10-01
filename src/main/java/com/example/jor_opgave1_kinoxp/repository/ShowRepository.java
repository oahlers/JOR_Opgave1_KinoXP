package com.example.jor_opgave1_kinoxp.repository;

import com.example.jor_opgave1_kinoxp.model.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ShowRepository extends JpaRepository<Show, Long> {

    List<Show> findByMovieId(Long movieId);

    List<Show> findByTheaterId(Long theaterId);

    List<Show> findByShowTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT s FROM Show s WHERE s.theaterId = :theaterId AND s.showTime = :showTime")
    List<Show> findByTheaterIdAndShowTime(@Param("theaterId") Long theaterId, @Param("showTime") LocalDateTime showTime);

    @Query("SELECT s FROM Show s WHERE s.movieId = :movieId AND s.showTime BETWEEN :start AND :end")
    List<Show> findByMovieIdAndShowTimeBetween(@Param("movieId") Long movieId,
                                               @Param("start") LocalDateTime start,
                                               @Param("end") LocalDateTime end);

    @Modifying
    @Query("DELETE FROM Show s WHERE s.movieId = :movieId")
    void deleteByMovieId(@Param("movieId") Long movieId);

    @Query("SELECT s FROM Show s JOIN FETCH s.movie JOIN FETCH s.theater WHERE s.showTime BETWEEN :start AND :end")
    List<Show> findShowsWithDetailsBetween(@Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);

    @Query("SELECT s FROM Show s WHERE s.theaterId = :theaterId AND s.showTime BETWEEN :start AND :end AND s.movieId <> :movieId")
    List<Show> findConflictsForTheaterAndDate(@Param("theaterId") Long theaterId,
                                              @Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end,
                                              @Param("movieId") Long movieId);

    @Query("SELECT COUNT(s) FROM Show s WHERE s.theaterId = :theaterId AND s.showTime BETWEEN :start AND :end AND s.movieId <> :movieId")
    Long countConflictsForTheaterBetweenExcludingMovie(@Param("theaterId") Long theaterId,
                                                       @Param("start") LocalDateTime start,
                                                       @Param("end") LocalDateTime end,
                                                       @Param("movieId") Long movieId);
}