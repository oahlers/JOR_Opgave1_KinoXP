package com.example.jor_opgave1_kinoxp.service;

import com.example.jor_opgave1_kinoxp.model.User;
import com.example.jor_opgave1_kinoxp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepo;

    public UserService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    public User registerUser(User user) {
        return userRepo.save(user);
    }

    public Optional<User> login(String username, String password) {
        System.out.println("Login attempt: username=" + username + ", password=" + password);

        Optional<User> userOpt = userRepo.findByUsername(username);

        if (userOpt.isEmpty()) {
            System.out.println("User not found!");
            return Optional.empty();
        }

        User user = userOpt.get();
        boolean passwordMatch = user.getPassword().equals(password);
        System.out.println("Password match: " + passwordMatch);

        if (passwordMatch) {
            return Optional.of(user);
        } else {
            return Optional.empty();
        }
    }

}
