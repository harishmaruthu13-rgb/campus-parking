package com.campus.parking.controller;

import com.campus.parking.model.User;
import com.campus.parking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");

        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username / Register Number is required"));
        }

        username = username.trim();
        String reqPass = (password != null && !password.trim().isEmpty()) ? password.trim() : username;

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Accept if password matches OR if password is same as username
            if (reqPass.equalsIgnoreCase(user.getPassword()) || reqPass.equalsIgnoreCase(user.getUsername())) {
                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "username", user.getUsername(),
                        "role", user.getRole()
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Incorrect password for ID: " + username));
            }
        }

        // Admin fallback
        if ("admin".equalsIgnoreCase(username)) {
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "username", "admin",
                    "role", "ADMIN"
            ));
        }

        // Visitor or Auto-Register fallback
        String role = "STUDENT";
        if (username.toUpperCase().startsWith("VIS") || username.toLowerCase().contains("visitor")) {
            role = "VISITOR";
        } else if (username.toUpperCase().startsWith("FAC") || username.toLowerCase().contains("staff")) {
            role = "FACULTY";
        }

        // Auto-register user in DB so they are stored
        User newUser = new User(null, username, username + "@campus.edu", reqPass, role);
        userRepository.save(newUser);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "username", username,
                "role", role
        ));
    }
}
