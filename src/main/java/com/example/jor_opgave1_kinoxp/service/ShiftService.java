package com.example.jor_opgave1_kinoxp.service;

import com.example.jor_opgave1_kinoxp.model.Shift;
import com.example.jor_opgave1_kinoxp.repository.ShiftRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ShiftService {

    private final ShiftRepository shiftRepository;

    public ShiftService(ShiftRepository shiftRepository) {
        this.shiftRepository = shiftRepository;
    }

    public List<Shift> getAllShifts() {
        List<Shift> shifts = shiftRepository.findAll();
        // Trigger lazy loading for staff
        shifts.forEach(shift -> {
            if (shift.getStaff() != null) {
                shift.getStaff().getFullName(); // Kun hent nødvendige felter
            }
        });
        return shifts;
    }

    public List<Shift> getShiftsByStaff(Long staffId) {
        return shiftRepository.findByStaffId(staffId);
    }

    public List<Shift> getShiftsByDate(LocalDate date) {
        List<Shift> shifts = shiftRepository.findByShiftDate(date);
        shifts.forEach(shift -> {
            if (shift.getStaff() != null) {
                shift.getStaff().getFullName(); // Kun hent nødvendige felter
            }
        });
        return shifts;
    }

    public List<Shift> getShiftsBetween(LocalDate start, LocalDate end) {
        List<Shift> shifts = shiftRepository.findByShiftDateBetween(start, end);
        shifts.forEach(shift -> {
            if (shift.getStaff() != null) {
                shift.getStaff().getFullName(); // Kun hent nødvendige felter
            }
        });
        return shifts;
    }

    public Shift createShift(Shift shift) {
        return shiftRepository.save(shift);
    }

    public Shift updateShift(Long id, Shift updatedShift) {
        Shift shift = shiftRepository.findById(id).orElseThrow();
        shift.setShiftDate(updatedShift.getShiftDate());
        shift.setStartTime(updatedShift.getStartTime());
        shift.setEndTime(updatedShift.getEndTime());
        shift.setShiftType(updatedShift.getShiftType());
        shift.setHours(updatedShift.getHours());
        return shiftRepository.save(shift);
    }

    public void deleteShift(Long id) {
        shiftRepository.deleteById(id);
    }
}