package com.campus.parking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories("com.campus.parking.repository")
@EntityScan("com.campus.parking.model")
public class CampusParkingBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CampusParkingBackendApplication.class, args);
	}

}
