package com.campus.parking.controller;

import com.campus.parking.model.ParkingLog;
import com.campus.parking.model.ParkingSlot;
import com.campus.parking.repository.BookingRepository;
import com.campus.parking.repository.ParkingLogRepository;
import com.campus.parking.repository.ParkingSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private ParkingSlotRepository slotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ParkingLogRepository logRepository;

    @GetMapping("/logs")
    public List<ParkingLog> getLogs() {
        return logRepository.findAllByOrderByTimestampDesc();
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetDemoData() {
        slotRepository.deleteAll();
        List<ParkingSlot> defaultSlots = Arrays.asList(
                new ParkingSlot(null, "A1", "available", ""),
                new ParkingSlot(null, "A2", "occupied", "TN55AB1234"),
                new ParkingSlot(null, "A3", "available", ""),
                new ParkingSlot(null, "A4", "reserved", "TN55CD4567"),
                new ParkingSlot(null, "A5", "available", ""),

                new ParkingSlot(null, "B1", "available", ""),
                new ParkingSlot(null, "B2", "occupied", "TN55EF7890"),
                new ParkingSlot(null, "B3", "available", ""),
                new ParkingSlot(null, "B4", "occupied", "TN55GH1111"),
                new ParkingSlot(null, "B5", "available", ""),

                new ParkingSlot(null, "C1", "reserved", "TN55IJ2222"),
                new ParkingSlot(null, "C2", "available", ""),
                new ParkingSlot(null, "C3", "occupied", "TN55KL3333"),
                new ParkingSlot(null, "C4", "available", ""),
                new ParkingSlot(null, "C5", "available", ""),

                new ParkingSlot(null, "D1", "available", ""),
                new ParkingSlot(null, "D2", "occupied", "TN55MN4444"),
                new ParkingSlot(null, "D3", "available", ""),
                new ParkingSlot(null, "D4", "reserved", "TN55OP5555"),
                new ParkingSlot(null, "D5", "available", "")
        );
        slotRepository.saveAll(defaultSlots);

        ParkingLog log = new ParkingLog(null, "RESET", "Demo slots reset to default", LocalDateTime.now());
        logRepository.save(log);

        return ResponseEntity.ok(Map.of("message", "Demo slots reset successfully"));
    }

    @PostMapping("/simulate-entry")
    public ResponseEntity<?> simulateEntry() {
        List<ParkingSlot> availableSlots = slotRepository.findAll().stream()
                .filter(s -> "available".equals(s.getStatus()))
                .toList();

        if (availableSlots.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No available slots to simulate entry"));
        }

        ParkingSlot slot = availableSlots.get(0);
        slot.setStatus("occupied");
        slot.setVehicleNumber("TN55QR" + (int)(Math.random() * 9000 + 1000));
        slotRepository.save(slot);

        ParkingLog log = new ParkingLog(null, "ENTRY", "Simulated entry into slot " + slot.getSlotNumber(), LocalDateTime.now());
        logRepository.save(log);

        Map<String, Object> res = new HashMap<>();
        res.put("message", "Vehicle entered slot " + slot.getSlotNumber());
        res.put("slot", slot);
        return ResponseEntity.ok(res);
    }
}
