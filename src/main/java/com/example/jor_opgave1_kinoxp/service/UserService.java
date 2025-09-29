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
        return userRepo.findByUsername(username)
                .filter(u -> u.getPassword().equals(password));
    }
}
