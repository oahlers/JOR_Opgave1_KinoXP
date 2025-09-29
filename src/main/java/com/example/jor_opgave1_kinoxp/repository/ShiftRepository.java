package com.example.jor_opgave1_kinoxp.repository;

import com.example.jor_opgave1_kinoxp.model.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByShiftDateBetween(LocalDate start, LocalDate end);
    List<Shift> findByStaffId(Long staffId);
    List<Shift> findByShiftDate(LocalDate date);
}