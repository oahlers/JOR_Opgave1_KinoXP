-- Opret databasen
DROP DATABASE IF EXISTS kinoXP;
CREATE DATABASE kinoXP;
USE kinoXP;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phonenumber VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE
);

INSERT INTO users (phonenumber, password, full_name, email) VALUES
('11111111', 'test', 'Test Kunde', 'test@example.com');

DROP TABLE IF EXISTS theaters;
CREATE TABLE theaters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    num_rows INT,
    seats_per_row INT
);

INSERT INTO theaters (name, num_rows, seats_per_row) VALUES
('Lille sal', 20, 12),
('Store sal', 25, 16);


DROP TABLE IF EXISTS movie;
CREATE TABLE movie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    category VARCHAR(50),
    age_limit INT,
    actors TEXT,
    duration INT,
    first_show_date DATE,
    show_days INT,
    theater_id INT,
    ticket_price DECIMAL(6,2),
    image_url VARCHAR(255)
);

INSERT INTO movie (title, category, age_limit, actors, duration, first_show_date, show_days, theater_id, ticket_price, image_url) VALUES
('Inception', 'Sci-Fi', 12, 'Leonardo DiCaprio, Marion Cotillard', 148, '2025-02-01', 3, 1, 95.00, NULL);

DROP TABLE IF EXISTS shows;
CREATE TABLE shows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT,
    theater_id INT,
    show_time DATETIME,
    FOREIGN KEY (movie_id) REFERENCES movie(id),
    FOREIGN KEY (theater_id) REFERENCES theaters(id)
);
INSERT INTO shows (movie_id, theater_id, show_time) VALUES
(1, 1, '2025-02-01 14:00:00'),
(1, 1, '2025-02-01 17:00:00'),
(1, 1, '2025-02-01 20:00:00');

DROP TABLE IF EXISTS bookings;
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    show_id INT,
    customer_name VARCHAR(100),
    seats INT,
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT NULL,
    FOREIGN KEY (show_id) REFERENCES shows(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO bookings (show_id, customer_name, seats, user_id) VALUES
(1, 'Test Kunde', 2, 1);

DROP TABLE IF EXISTS staff;
CREATE TABLE staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    position VARCHAR(50),
    total_hours DOUBLE DEFAULT 0.0
);
INSERT INTO staff (username, password, full_name, position, total_hours) VALUES
('staff', 'staff123', 'Test Medarbejder', 'Ticket & Sales', 0.0);

DROP TABLE IF EXISTS shifts;
CREATE TABLE shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT,
    shift_date DATE,
    start_time TIME,
    end_time TIME,
    shift_type VARCHAR(20),
    hours DOUBLE,
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    CONSTRAINT chk_shift_times CHECK (
        (start_time = '13:00:00' AND end_time = '23:00:00') OR
        (start_time = '13:00:00' AND end_time = '18:00:00') OR
        (start_time = '18:00:00' AND end_time = '23:00:00')
    )
);
INSERT INTO shifts (staff_id, shift_date, start_time, end_time, shift_type, hours) VALUES
(1, '2025-02-01', '13:00:00', '18:00:00', 'Half Day', 5.0);

DROP TABLE IF EXISTS sweets;
CREATE TABLE sweets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    price DECIMAL(5,2)
);
INSERT INTO sweets (name, price) VALUES
('Popcorn', 45.00);

-- Junction table to bind sweets to bookings (order lines)
DROP TABLE IF EXISTS booking_sweets;
CREATE TABLE booking_sweets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    sweet_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_each DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (sweet_id) REFERENCES sweets(id)
);
