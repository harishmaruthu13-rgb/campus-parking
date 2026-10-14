# Campus Parking Management System 🚗🎓

A full-stack Campus Parking Management System built with **Spring Boot 3**, **Spring Data JPA**, **H2 In-Memory Database**, and a responsive web dashboard.

---

## 🌟 Features

- **User Authentication**: Student, faculty, and visitor registration and login.
- **Slot Availability & Reservation**: Real-time slot status, zone-based parking, and automated booking allocation.
- **Booking Management**: Create bookings, check-in, check-out, and view booking history.
- **Admin Dashboard**: Real-time stats on occupied vs. vacant slots, parking activity logs, and slot management.
- **Embedded Web Frontend**: Intuitive UI with dashboard, slot selection, and administration portal.
- **Zero Configuration Database**: Built-in H2 database with automatic schema creation and mock data initialization.

---

## 🛠️ Tech Stack

- **Backend**: Java 17, Spring Boot 3.3.4 (Spring Web, Spring Data JPA, Lombok)
- **Database**: H2 Database (In-Memory, with H2 Console enabled) / PostgreSQL ready
- **Frontend**: HTML5, Modern CSS, Vanilla JavaScript
- **Build Tool**: Maven

---

## 🚀 Getting Started

### Prerequisites

- Java Development Kit (JDK) 17 or higher
- Maven 3.8+ (or use the included `./mvnw` wrapper)

### Running the Application

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ajaymanikandanoff/campus-parking.git
   cd campus-parking
   ```

2. **Run using Maven Wrapper**:
   - On Windows:
     ```cmd
     mvnw.cmd spring-boot:run
     ```
   - On Linux/macOS:
     ```bash
     ./mvnw spring-boot:run
     ```

3. **Access the Application**:
   - **Web UI**: [http://localhost:8080](http://localhost:8080)
   - **H2 Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
     - JDBC URL: `jdbc:h2:mem:campus_parking_db`
     - Username: `sa`
     - Password: *(leave blank)*

---

## 📁 Project Structure

```text
campus-parking-backend/
├── src/
│   ├── main/
│   │   ├── java/com/campus/parking/
│   │   │   ├── config/          # Data initializers and setup
│   │   │   ├── controller/      # REST API Controllers (Auth, Slot, Booking, Admin)
│   │   │   ├── model/           # JPA Entities (User, ParkingSlot, Booking, ParkingLog)
│   │   │   └── repository/      # Spring Data Repositories
│   │   └── resources/
│   │       ├── static/          # Web frontend (HTML, CSS, JS)
│   │       └── application.properties
│   └── test/                    # Unit and integration tests
├── pom.xml
└── README.md
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
