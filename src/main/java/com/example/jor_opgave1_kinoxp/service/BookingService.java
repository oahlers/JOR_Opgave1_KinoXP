package com.example.jor_opgave1_kinoxp.service;

import com.example.jor_opgave1_kinoxp.model.Booking;
import com.example.jor_opgave1_kinoxp.model.BookingSweet;
import com.example.jor_opgave1_kinoxp.model.Show;
import com.example.jor_opgave1_kinoxp.model.Sweet;
import com.example.jor_opgave1_kinoxp.model.User;
import com.example.jor_opgave1_kinoxp.repository.BookingRepository;
import com.example.jor_opgave1_kinoxp.repository.BookingSweetRepository;
import com.example.jor_opgave1_kinoxp.repository.ShowRepository;
import com.example.jor_opgave1_kinoxp.repository.SweetRepository;
import com.example.jor_opgave1_kinoxp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ShowRepository showRepository;
    private final UserRepository userRepository;
    private final BookingSweetRepository bookingSweetRepository;
    private final SweetRepository sweetRepository;

    public BookingService(BookingRepository bookingRepository,
                          ShowRepository showRepository,
                          UserRepository userRepository,
                          BookingSweetRepository bookingSweetRepository,
                          SweetRepository sweetRepository) {
        this.bookingRepository = bookingRepository;
        this.showRepository = showRepository;
        this.userRepository = userRepository;
        this.bookingSweetRepository = bookingSweetRepository;
        this.sweetRepository = sweetRepository;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id).orElseThrow();
    }

    public Booking createBooking(Long showId, int seats, Long userId) {
        Show show = showRepository.findById(showId).orElseThrow();

        Booking booking = new Booking();
        booking.setShow(show);
        booking.setSeats(seats);
        booking.setBookingTime(LocalDateTime.now());

        if (userId != null) {
            User user = userRepository.findById(userId).orElseThrow();
            booking.setUser(user);
        }

        return bookingRepository.save(booking);
    }

    public Booking updateSeats(Long id, int seats) {
        Booking booking = bookingRepository.findById(id).orElseThrow();
        booking.setSeats(seats);
        return bookingRepository.save(booking);
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    public List<Booking> findByUserId(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public Booking rescheduleBooking(Long bookingId, Long newShowId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        Show newShow = showRepository.findById(newShowId).orElseThrow();
        booking.setShow(newShow);
        return bookingRepository.save(booking);
    }

    public int occupiedSeatsForMovieOnDate(Long movieId, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        Integer sum = bookingRepository.sumSeatsByMovieAndShowTimeBetween(movieId, start, end);
        return sum != null ? sum : 0;
    }

    public int occupiedSeatsForShow(Long showId) {
        Integer sum = bookingRepository.sumSeatsByShowId(showId);
        return sum != null ? sum : 0;
    }

    public BookingSweet addSweetToBooking(Long bookingId, Long sweetId, int quantity) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        Sweet sweet = sweetRepository.findById(sweetId).orElseThrow();
        BookingSweet bs = new BookingSweet();
        bs.setBooking(booking);
        bs.setSweet(sweet);
        bs.setQuantity(quantity > 0 ? quantity : 1);
        bs.setPriceEach(sweet.getPrice());
        return bookingSweetRepository.save(bs);
    }

    public List<BookingSweet> listBookingSweets(Long bookingId) {
        return bookingSweetRepository.findByBookingId(bookingId);
    }

    public void removeBookingSweet(Long bookingSweetId) {
        bookingSweetRepository.deleteById(bookingSweetId);
    }
}
