package com.example.jor_opgave1_kinoxp.service;

import com.example.jor_opgave1_kinoxp.model.Booking;
import com.example.jor_opgave1_kinoxp.model.Show;
import com.example.jor_opgave1_kinoxp.repository.BookingRepository;
import com.example.jor_opgave1_kinoxp.repository.ShowRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ShowRepository showRepository;

    public BookingService(BookingRepository bookingRepository, ShowRepository showRepository) {
        this.bookingRepository = bookingRepository;
        this.showRepository = showRepository;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id).orElseThrow();
    }

    public Booking createBooking(Long showId, String customerName, int seats) {
        Show show = showRepository.findById(showId).orElseThrow();

        Booking booking = new Booking();
        booking.setShow(show);
        booking.setCustomerName(customerName);
        booking.setSeats(seats);
        booking.setBookingTime(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    public Booking updateBooking(Long id, String customerName, int seats) {
        Booking booking = bookingRepository.findById(id).orElseThrow();
        booking.setCustomerName(customerName);
        booking.setSeats(seats);
        return bookingRepository.save(booking);
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    public List<Booking> searchBookingsByCustomer(String customerName) {
        return bookingRepository.findByCustomerName(customerName);
    }
}
