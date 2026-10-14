package com.campus.parking.controller;

import com.campus.parking.model.Booking;
import com.campus.parking.model.ParkingLog;
import com.campus.parking.model.ParkingSlot;
import com.campus.parking.repository.BookingRepository;
import com.campus.parking.repository.ParkingLogRepository;
import com.campus.parking.repository.ParkingSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ParkingSlotRepository slotRepository;

    @Autowired
    private ParkingLogRepository logRepository;

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        if (booking.getSlotNumber() == null || booking.getSlotNumber().isEmpty()) {
            return ResponseEntity.badRequest().body("Slot number is required");
        }

        Optional<ParkingSlot> slotOpt = slotRepository.findBySlotNumber(booking.getSlotNumber());
        if (slotOpt.isPresent()) {
            ParkingSlot slot = slotOpt.get();
            slot.setStatus("reserved");
            if (booking.getVehicleNumber() != null) {
                slot.setVehicleNumber(booking.getVehicleNumber());
            }
            slotRepository.save(slot);

            booking.setBookingTime(LocalDateTime.now());
            booking.setStatus("CONFIRMED");
            Booking savedBooking = bookingRepository.save(booking);

            ParkingLog log = new ParkingLog(null, "RESERVATION",
                    "Slot " + booking.getSlotNumber() + " booked for vehicle " + booking.getVehicleNumber(),
                    LocalDateTime.now());
            logRepository.save(log);

            return ResponseEntity.ok(savedBooking);
        }

        return ResponseEntity.notFound().build();
    }
}
