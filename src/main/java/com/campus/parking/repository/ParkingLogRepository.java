package com.campus.parking.repository;

import com.campus.parking.model.ParkingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingLogRepository extends JpaRepository<ParkingLog, Long> {
    List<ParkingLog> findAllByOrderByTimestampDesc();
}
