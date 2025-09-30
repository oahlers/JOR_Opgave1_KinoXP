package com.example.jor_opgave1_kinoxp.controller;

import com.example.jor_opgave1_kinoxp.model.Sweet;
import com.example.jor_opgave1_kinoxp.service.SweetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sweets")
public class SweetController {

    private final SweetService sweetService;

    public SweetController(SweetService sweetService) {
        this.sweetService = sweetService;
    }

    @GetMapping
    public List<Sweet> getAllSweets() {
        return sweetService.getAllSweets();
    }

    @GetMapping("/{id}")
    public Sweet getSweet(@PathVariable Long id) {
        return sweetService.getSweetById(id);
    }

    @PostMapping
    public Sweet createSweet(@RequestBody Sweet sweet) {
        return sweetService.createSweet(sweet);
    }

    @PutMapping("/{id}")
    public Sweet updateSweet(@PathVariable Long id, @RequestBody Sweet sweet) {
        return sweetService.updateSweet(id, sweet);
    }

    @DeleteMapping("/{id}")
    public void deleteSweet(@PathVariable Long id) {
        sweetService.deleteSweet(id);
    }
}