package com.example.jor_opgave1_kinoxp.controller;

import com.example.jor_opgave1_kinoxp.model.Booking;
import com.example.jor_opgave1_kinoxp.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<Booking> getAll() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/by-customer")
    public List<Booking> getByCustomer(@RequestParam("name") String customerName) {
        return bookingService.searchBookingsByCustomer(customerName);
    }

    @GetMapping("/occupied")
    public int getOccupied(@RequestParam("movieId") Long movieId, @RequestParam("date") String dateStr) {
        LocalDate date = LocalDate.parse(dateStr);
        return bookingService.occupiedSeatsForMovieOnDate(movieId, date);
    }

    @PostMapping
    public Booking create(@RequestBody CreateBookingRequest req) {
        return bookingService.createBooking(req.getShowId(), req.getCustomerName(), req.getSeats());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        bookingService.deleteBooking(id);
    }

    @PutMapping("/{id}/reschedule")
    public Booking reschedule(@PathVariable Long id, @RequestParam("newShowId") Long newShowId) {
        return bookingService.rescheduleBooking(id, newShowId);
    }

    // Simple DTO for booking creation
    public static class CreateBookingRequest {
        private Long showId;
        private String customerName;
        private int seats;

        public Long getShowId() { return showId; }
        public void setShowId(Long showId) { this.showId = showId; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public int getSeats() { return seats; }
        public void setSeats(int seats) { this.seats = seats; }
    }
}
