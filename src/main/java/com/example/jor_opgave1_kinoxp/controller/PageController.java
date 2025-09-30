package com.example.jor_opgave1_kinoxp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String dashboard() {
        return "dashboard.html";
    }

    @GetMapping("/movies")
    public String movies() {
        return "movies.html";
    }

    @GetMapping("/calendar")
    public String calendar() {
        return "calendar.html";
    }

    @GetMapping("/staff")
    public String staff() {
        return "staff.html";
    }

    @GetMapping("/my-bookings")
    public String myBookings() {
        return "my-bookings.html";
    }
}