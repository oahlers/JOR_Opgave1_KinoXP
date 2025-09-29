package com.example.jor_opgave1_kinoxp.repository;

import com.example.jor_opgave1_kinoxp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhonenumber(String phonenumber);

}