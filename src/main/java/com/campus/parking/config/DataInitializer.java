package com.campus.parking.config;

import com.campus.parking.model.ParkingSlot;
import com.campus.parking.model.User;
import com.campus.parking.repository.ParkingSlotRepository;
import com.campus.parking.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(ParkingSlotRepository slotRepository, UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = new User(null, "admin", "admin@campus.edu", "admin123", "ADMIN");
                User student1 = new User(null, "9925051005", "student1005@campus.edu", "123456", "STUDENT");
                User faculty = new User(null, "FAC001", "faculty@campus.edu", "faculty123", "FACULTY");
                User visitor = new User(null, "VIS001", "visitor@campus.edu", "visitor123", "VISITOR");

                userRepository.saveAll(Arrays.asList(admin, student1, faculty, visitor));
            }

            if (slotRepository.count() == 0) {
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
            }
        };
    }
}
