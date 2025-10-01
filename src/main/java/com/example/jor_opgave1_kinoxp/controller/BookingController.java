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

    @GetMapping("/by-user")
    public List<Booking> getByUser(@RequestParam("userId") Long userId) {
        return bookingService.findByUserId(userId);
    }

    @GetMapping("/occupied")
    public int getOccupied(@RequestParam("movieId") Long movieId, @RequestParam("date") String dateStr) {
        LocalDate date = LocalDate.parse(dateStr);
        return bookingService.occupiedSeatsForMovieOnDate(movieId, date);
    }

    @GetMapping("/occupied-by-show")
    public int getOccupiedByShow(@RequestParam("showId") Long showId) {
        return bookingService.occupiedSeatsForShow(showId);
    }

    @PostMapping
    public Booking create(@RequestBody CreateBookingRequest req) {
        return bookingService.createBooking(req.getShowId(), req.getSeats(), req.getUserId());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        bookingService.deleteBooking(id);
    }

    @PutMapping("/{id}/reschedule")
    public Booking reschedule(@PathVariable Long id, @RequestParam("newShowId") Long newShowId) {
        return bookingService.rescheduleBooking(id, newShowId);
    }

    @GetMapping("/{bookingId}/sweets")
    public List<com.example.jor_opgave1_kinoxp.model.BookingSweet> listBookingSweets(@PathVariable Long bookingId) {
        return bookingService.listBookingSweets(bookingId);
    }

    @PostMapping("/{bookingId}/sweets")
    public com.example.jor_opgave1_kinoxp.model.BookingSweet addSweetToBooking(
            @PathVariable Long bookingId,
            @RequestBody AddSweetRequest req) {
        return bookingService.addSweetToBooking(bookingId, req.getSweetId(), req.getQuantity());
    }

    @DeleteMapping("/sweets/{id}")
    public void removeBookingSweet(@PathVariable Long id) {
        bookingService.removeBookingSweet(id);
    }

    public static class CreateBookingRequest {
        private Long showId;
        private int seats;
        private Long userId;

        public Long getShowId() { return showId; }
        public void setShowId(Long showId) { this.showId = showId; }
        public int getSeats() { return seats; }
        public void setSeats(int seats) { this.seats = seats; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
    }

    public static class AddSweetRequest {
        private Long sweetId;
        private int quantity = 1;

        public Long getSweetId() { return sweetId; }
        public void setSweetId(Long sweetId) { this.sweetId = sweetId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}
