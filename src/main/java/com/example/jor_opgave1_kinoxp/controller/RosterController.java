package com.example.jor_opgave1_kinoxp.controller;

import com.example.jor_opgave1_kinoxp.model.Roster;
import com.example.jor_opgave1_kinoxp.service.RosterService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/roster")
public class RosterController {

    private final RosterService rosterService;

    public RosterController(RosterService rosterService) {
        this.rosterService = rosterService;
    }

    @GetMapping
    public List<Roster> getAllRoster() {
        return rosterService.getAllRosterEntries();
    }

    @GetMapping("/date")
    public List<Roster> getRosterByDate(@RequestParam String date) {
        return rosterService.getRosterByDate(LocalDate.parse(date));
    }

    @PostMapping
    public Roster createRosterEntry(@RequestParam Long staffId,
                                    @RequestParam String date,
                                    @RequestParam String shift) {
        return rosterService.createRosterEntry(staffId, LocalDate.parse(date), shift);
    }

    @DeleteMapping("/{id}")
    public void deleteRoster(@PathVariable Long id) {
        rosterService.deleteRosterEntry(id);
    }
}
