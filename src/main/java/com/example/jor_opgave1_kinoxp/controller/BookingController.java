package com.example.jor_opgave1_kinoxp.controller;

import com.example.jor_opgave1_kinoxp.model.Booking;
import com.example.jor_opgave1_kinoxp.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/{id}")
    public Booking getBooking(@PathVariable Long id) {
        return bookingService.getBookingById(id);
    }

    @GetMapping("/search")
    public List<Booking> searchBookings(@RequestParam String customerName) {
        return bookingService.searchBookingsByCustomer(customerName);
    }

    @PostMapping
    public Booking createBooking(@RequestParam Long showId,
                                 @RequestParam String customerName,
                                 @RequestParam int seats) {
        return bookingService.createBooking(showId, customerName, seats);
    }

    @PutMapping("/{id}")
    public Booking updateBooking(@PathVariable Long id,
                                 @RequestParam String customerName,
                                 @RequestParam int seats) {
        return bookingService.updateBooking(id, customerName, seats);
    }

    @DeleteMapping("/{id}")
    public void cancelBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
    }
}
