package com.example.jor_opgave1_kinoxp.service;

import com.example.jor_opgave1_kinoxp.model.Booking;
import com.example.jor_opgave1_kinoxp.model.Show;
import com.example.jor_opgave1_kinoxp.model.User;
import com.example.jor_opgave1_kinoxp.repository.BookingRepository;
import com.example.jor_opgave1_kinoxp.repository.BookingSweetRepository;
import com.example.jor_opgave1_kinoxp.repository.ShowRepository;
import com.example.jor_opgave1_kinoxp.repository.SweetRepository;
import com.example.jor_opgave1_kinoxp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceCreateBookingTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private ShowRepository showRepository;
    @Mock private UserRepository userRepository;
    @Mock private BookingSweetRepository bookingSweetRepository;
    @Mock private SweetRepository sweetRepository;

    @InjectMocks private BookingService bookingService;

    private Show show;
    private User user;

    @BeforeEach
    void setUp() {
        show = new Show();
        show.setId(10L);
        show.setMovieId(5L);
        show.setShowTime(LocalDateTime.now().plusDays(1));

        user = new User();
        user.setId(7L);
        user.setFullName("Test Kunde");
    }

    @Test
    void createBooking_withUserId_setsUserAndSaves() {
        when(showRepository.findById(10L)).thenReturn(Optional.of(show));
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        Booking created = bookingService.createBooking(10L, 2, 7L);

        assertThat(created.getShow()).isEqualTo(show);
        assertThat(created.getSeats()).isEqualTo(2);
        assertThat(created.getUser()).isEqualTo(user);
        assertThat(created.getBookingTime()).isNotNull();

        verify(showRepository).findById(10L);
        verify(userRepository).findById(7L);
        verify(bookingRepository).save(any(Booking.class));
    }
}
