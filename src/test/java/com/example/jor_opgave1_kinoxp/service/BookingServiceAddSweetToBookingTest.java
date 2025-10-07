package com.example.jor_opgave1_kinoxp.service;

import com.example.jor_opgave1_kinoxp.model.Booking;
import com.example.jor_opgave1_kinoxp.model.BookingSweet;
import com.example.jor_opgave1_kinoxp.model.Sweet;
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

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceAddSweetToBookingTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private ShowRepository showRepository;
    @Mock private UserRepository userRepository;
    @Mock private BookingSweetRepository bookingSweetRepository;
    @Mock private SweetRepository sweetRepository;

    @InjectMocks private BookingService bookingService;

    @Test
    void addSweetToBooking_quantityDefaultsToOne_andPriceIsSetFromSweet() {
        Booking booking = new Booking();
        booking.setId(123L);
        Sweet sweet = new Sweet();
        sweet.setId(9L);
        sweet.setPrice(new BigDecimal("45.00"));

        when(bookingRepository.findById(123L)).thenReturn(Optional.of(booking));
        when(sweetRepository.findById(9L)).thenReturn(Optional.of(sweet));
        when(bookingSweetRepository.save(any(BookingSweet.class))).thenAnswer(inv -> inv.getArgument(0));

        BookingSweet saved = bookingService.addSweetToBooking(123L, 9L, 0);

        assertThat(saved.getBooking()).isEqualTo(booking);
        assertThat(saved.getSweet()).isEqualTo(sweet);
        assertThat(saved.getQuantity()).isEqualTo(1);
        assertThat(saved.getPriceEach()).isEqualByComparingTo(new BigDecimal("45.00"));

        verify(bookingSweetRepository).save(any(BookingSweet.class));
    }
}
