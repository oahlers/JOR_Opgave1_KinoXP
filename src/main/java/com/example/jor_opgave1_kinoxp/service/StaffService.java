package com.example.jor_opgave1_kinoxp.service;

import com.example.jor_opgave1_kinoxp.model.Staff;
import com.example.jor_opgave1_kinoxp.repository.StaffRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StaffService {

    private final StaffRepository staffRepository;

    public StaffService(StaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    public List<Staff> getAllStaff() {
        List<Staff> staffList = staffRepository.findAll();
        staffList.forEach(staff -> staff.getShifts().size());
        return staffList;
    }

    public Staff getStaffById(Long id) {
        Staff staff = staffRepository.findById(id).orElseThrow();
        staff.getShifts().size();
        return staff;
    }

    public Staff createStaff(Staff staff) {
        return staffRepository.save(staff);
    }

    public Staff updateStaff(Long id, Staff updatedStaff) {
        Staff staff = staffRepository.findById(id).orElseThrow();
        staff.setFullName(updatedStaff.getFullName());
        staff.setPosition(updatedStaff.getPosition());
        staff.setUsername(updatedStaff.getUsername());
        if (updatedStaff.getPassword() != null && !updatedStaff.getPassword().isEmpty()) {
            staff.setPassword(updatedStaff.getPassword());
        }
        return staffRepository.save(staff);
    }

    public void deleteStaff(Long id) {
        staffRepository.deleteById(id);
    }

    public Optional<Staff> login(String username, String password) {
        Optional<Staff> staffOpt = staffRepository.findByUsername(username);

        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();
            if (staff.getPassword().equals(password)) {
                Staff cleanStaff = new Staff();
                cleanStaff.setId(staff.getId());
                cleanStaff.setUsername(staff.getUsername());
                cleanStaff.setFullName(staff.getFullName());
                cleanStaff.setPosition(staff.getPosition());
                cleanStaff.setTotalHours(staff.getTotalHours());
                return Optional.of(cleanStaff);
            }
        }
        return Optional.empty();
    }
}