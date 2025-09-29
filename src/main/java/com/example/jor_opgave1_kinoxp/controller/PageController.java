package com.example.jor_opgave1_kinoxp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard.html";
    }

    @GetMapping("/")
    public String landing() {
        return "landing.html";
    }

    @GetMapping("/movies")
    public String movies() {
        return "movies.html";
    }

    @GetMapping("/shows")
    public String shows() {
        return "shows.html";
    }

    @GetMapping("/bookings")
    public String bookings() {
        return "bookings.html";
    }

    @GetMapping("/staff")
    public String staff() {
        return "staff.html";
    }

    @GetMapping("/roster")
    public String roster() {
        return "roster.html";
    }

    @GetMapping("/sweets")
    public String sweets() {
        return "sweets.html";
    }
}
