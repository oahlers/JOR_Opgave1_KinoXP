package com.example.jor_opgave1_kinoxp.controller;

import com.example.jor_opgave1_kinoxp.model.User;
import com.example.jor_opgave1_kinoxp.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody User loginRequest) {
        Optional<User> user = userService.login(loginRequest.getUsername(), loginRequest.getPassword());
        return user.orElseThrow(() -> new RuntimeException("Forkert brugernavn eller adgangskode"));
    }
}
