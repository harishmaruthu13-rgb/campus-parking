package com.campus.parking.controller;

import com.campus.parking.model.ParkingSlot;
import com.campus.parking.repository.ParkingSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin(origins = "*")
public class SlotController {

    @Autowired
    private ParkingSlotRepository slotRepository;

    @GetMapping
    public List<ParkingSlot> getAllSlots() {
        return slotRepository.findAll();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long total = slotRepository.count();
        long available = slotRepository.countByStatus("available");
        long occupied = slotRepository.countByStatus("occupied");
        long reserved = slotRepository.countByStatus("reserved");

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("available", available);
        stats.put("occupied", occupied);
        stats.put("reserved", reserved);

        return ResponseEntity.ok(stats);
    }

    @PutMapping("/{slotNumber}")
    public ResponseEntity<?> updateSlot(@PathVariable String slotNumber, @RequestBody Map<String, String> payload) {
        Optional<ParkingSlot> slotOpt = slotRepository.findBySlotNumber(slotNumber);
        if (slotOpt.isPresent()) {
            ParkingSlot slot = slotOpt.get();
            if (payload.containsKey("status")) {
                slot.setStatus(payload.get("status"));
            }
            if (payload.containsKey("vehicleNumber")) {
                slot.setVehicleNumber(payload.get("vehicleNumber"));
            }
            slotRepository.save(slot);
            return ResponseEntity.ok(slot);
        }
        return ResponseEntity.notFound().build();
    }
}
