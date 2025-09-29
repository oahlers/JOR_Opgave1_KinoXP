package com.example.jor_opgave1_kinoxp.service;

import com.example.jor_opgave1_kinoxp.model.Roster;
import com.example.jor_opgave1_kinoxp.model.Staff;
import com.example.jor_opgave1_kinoxp.repository.RosterRepository;
import com.example.jor_opgave1_kinoxp.repository.StaffRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class RosterService {

    private final RosterRepository rosterRepository;
    private final StaffRepository staffRepository;

    public RosterService(RosterRepository rosterRepository, StaffRepository staffRepository) {
        this.rosterRepository = rosterRepository;
        this.staffRepository = staffRepository;
    }

    public List<Roster> getAllRosterEntries() {
        return rosterRepository.findAll();
    }

    public List<Roster> getRosterByDate(LocalDate date) {
        return rosterRepository.findByWorkDate(date);
    }

    public Roster createRosterEntry(Long staffId, LocalDate date, String shift) {
        Staff staff = staffRepository.findById(staffId).orElseThrow();
        Roster roster = new Roster();
        roster.setStaff(staff);
        roster.setWorkDate(date);
        roster.setShift(shift);
        return rosterRepository.save(roster);
    }

    public void deleteRosterEntry(Long id) {
        rosterRepository.deleteById(id);
    }
}
