package com.example.jor_opgave1_kinoxp.service;

import com.example.jor_opgave1_kinoxp.repository.BookingRepository;
import com.example.jor_opgave1_kinoxp.repository.BookingSweetRepository;
import com.example.jor_opgave1_kinoxp.repository.ShowRepository;
import com.example.jor_opgave1_kinoxp.repository.SweetRepository;
import com.example.jor_opgave1_kinoxp.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceOccupiedSeatsTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private ShowRepository showRepository;
    @Mock private UserRepository userRepository;
    @Mock private BookingSweetRepository bookingSweetRepository;
    @Mock private SweetRepository sweetRepository;

    @InjectMocks private BookingService bookingService;

    @Test
    void occupiedSeatsForMovieOnDate_returnsZeroWhenRepositoryReturnsNull() {
        Long movieId = 5L;
        LocalDate date = LocalDate.of(2025, 2, 1);
        when(bookingRepository.sumSeatsByMovieAndShowTimeBetween(anyLong(), any(), any())).thenReturn(null);

        int occupied = bookingService.occupiedSeatsForMovieOnDate(movieId, date);

        assertThat(occupied).isZero();
        verify(bookingRepository).sumSeatsByMovieAndShowTimeBetween(eq(movieId), any(), any());
    }
}
