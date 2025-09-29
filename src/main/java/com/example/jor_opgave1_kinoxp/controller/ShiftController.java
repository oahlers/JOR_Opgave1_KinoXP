package com.example.jor_opgave1_kinoxp.controller;

import com.example.jor_opgave1_kinoxp.model.Shift;
import com.example.jor_opgave1_kinoxp.service.ShiftService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    private final ShiftService shiftService;

    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    @GetMapping
    public List<Shift> getAllShifts() {
        return shiftService.getAllShifts();
    }

    @GetMapping("/staff/{staffId}")
    public List<Shift> getShiftsByStaff(@PathVariable Long staffId) {
        return shiftService.getShiftsByStaff(staffId);
    }

    @GetMapping("/date/{date}")
    public List<Shift> getShiftsByDate(@PathVariable String date) {
        return shiftService.getShiftsByDate(LocalDate.parse(date));
    }

    @GetMapping("/between")
    public List<Shift> getShiftsBetween(@RequestParam String start, @RequestParam String end) {
        return shiftService.getShiftsBetween(LocalDate.parse(start), LocalDate.parse(end));
    }

    @PostMapping
    public Shift createShift(@RequestBody Shift shift) {
        return shiftService.createShift(shift);
    }

    @PutMapping("/{id}")
    public Shift updateShift(@PathVariable Long id, @RequestBody Shift shift) {
        return shiftService.updateShift(id, shift);
    }

    @DeleteMapping("/{id}")
    public void deleteShift(@PathVariable Long id) {
        shiftService.deleteShift(id);
    }
}