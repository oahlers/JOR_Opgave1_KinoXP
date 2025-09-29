package com.example.jor_opgave1_kinoxp.controller;

import com.example.jor_opgave1_kinoxp.model.Staff;
import com.example.jor_opgave1_kinoxp.service.StaffService;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
public class StaffAuthController {

    private final StaffService staffService;

    public StaffAuthController(StaffService staffService) {
        this.staffService = staffService;
    }

    @PostMapping("/login")
    public Staff login(@RequestBody Staff loginRequest) {
        Optional<Staff> staff = staffService.login(loginRequest.getUsername(), loginRequest.getPassword());
        return staff.orElseThrow(() -> new RuntimeException("Forkert brugernavn eller adgangskode for medarbejder"));
    }
}