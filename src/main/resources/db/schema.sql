-- Opret databasen
DROP DATABASE IF EXISTS kinoXP;
CREATE DATABASE kinoXP;
USE kinoXP;

-- Brugere (OPDATERET - bruger telefonnummer som login)
DROP TABLE IF EXISTS users;

CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       phonenumber VARCHAR(15) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       full_name VARCHAR(100) NOT NULL,
                       email VARCHAR(100) UNIQUE
);

INSERT INTO users (phonenumber, password, full_name, email) VALUES
                                                                ('+4561882812', 'jegelskerfilm', 'Sarah Black', 'sarahblack@example.com'),
                                                                ('+4512321255', 'jegelskerfilm', 'Anders Sørensen', 'anders@example.com'),
                                                                ('+4598756432', 'jegelskerfilm', 'Birgit Hansen', 'birgit@example.com'),
                                                                ('+4558736290', 'jegelskerfilm', 'Christian Nielsen', 'christian@example.com'),
                                                                ('+4587540912', 'jegelskerfilm', 'Daniel Pedersen', 'daniel@example.com'),
                                                                ('+4575649309', 'jegelskerfilm', 'Eva Kristensen', 'eva@example.com'),
                                                                ('+4576980012', 'jegelskerfilm', 'Frederik Madsen', 'frederik@example.com'),
                                                                ('+4576540011', 'jegelskerfilm', 'Grethe Jensen', 'grethe@example.com'),
                                                                ('+4565881233', 'jegelskerfilm', 'Henrik Larsen', 'henrik@example.com'),
                                                                ('+4584917688', 'jegelskerfilm', 'Ida Mortensen', 'ida@example.com'),
                                                                ('+4547120019', 'jegelskerfilm', 'Jakob Olsen', 'jakob@example.com'),
                                                                ('+4582018784', 'jegelskerfilm', 'Karina Johansen', 'karina@example.com'),
                                                                ('+4592800043', 'jegelskerfilm', 'Lars Petersen', 'lars@example.com'),
                                                                ('+4581875501', 'jegelskerfilm', 'Mia Andersen', 'mia@example.com'),
                                                                ('+4598002812', 'jegelskerfilm', 'Niels Thomsen', 'niels@example.com'),
                                                                ('+4574829954', 'jegelskerfilm', 'Ole Rasmussen', 'ole@example.com'),
                                                                ('+4512884377', 'jegelskerfilm', 'Pia Sørensen', 'pia@example.com'),
                                                                ('+4575821821', 'jegelskerfilm', 'Rene Kristensen', 'rene@example.com'),
                                                                ('+4582324401', 'jegelskerfilm', 'Sofie Hansen', 'sofie@example.com'),
                                                                ('+4577829943', 'jegelskerfilm', 'Thomas Madsen', 'thomas@example.com'),
                                                                ('+4584772123', 'jegelskerfilm', 'Ulrik Nielsen', 'ulrik@example.com');

-- Biografer
DROP TABLE IF EXISTS theaters;

CREATE TABLE theaters (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          name VARCHAR(50),
                          num_rows INT,
                          seats_per_row INT
);

INSERT INTO theaters (name, num_rows, seats_per_row) VALUES
                                                         ('Small Theater', 20, 12),
                                                         ('Large Theater', 25, 16);

-- Film
DROP TABLE IF EXISTS movies;

CREATE TABLE movies (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(100),
                        category VARCHAR(50),
                        age_limit INT,
                        actors TEXT,
                        duration INT
);

INSERT INTO movies (title, category, age_limit, actors, duration) VALUES
                                                                      ('Inception', 'Sci-Fi', 12, 'Leonardo DiCaprio, Marion Cotillard', 148),
                                                                      ('The Dark Knight', 'Action', 15, 'Christian Bale, Heath Ledger', 152),
                                                                      ('Pulp Fiction', 'Crime', 18, 'John Travolta, Uma Thurman', 154);

-- Forestillinger
DROP TABLE IF EXISTS shows;

CREATE TABLE shows (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       movie_id INT,
                       theater_id INT,
                       show_time DATETIME,
                       FOREIGN KEY (movie_id) REFERENCES movies(id),
                       FOREIGN KEY (theater_id) REFERENCES theaters(id)
);

INSERT INTO shows (movie_id, theater_id, show_time) VALUES
                                                        (1, 1, '2025-02-01 18:00:00'),
                                                        (1, 1, '2025-02-01 21:00:00'),
                                                        (2, 2, '2025-02-01 19:30:00'),
                                                        (3, 1, '2025-02-02 20:00:00');

-- Booking
DROP TABLE IF EXISTS bookings;

CREATE TABLE bookings (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          show_id INT,
                          customer_name VARCHAR(100),
                          seats INT,
                          booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (show_id) REFERENCES shows(id)
);

INSERT INTO bookings (show_id, customer_name, seats) VALUES
                                                         (1, 'Sarah Black', 2),
                                                         (1, 'Anders Sørensen', 4),
                                                         (2, 'Birgit Hansen', 3);

-- Personale
DROP TABLE IF EXISTS staff;

CREATE TABLE staff (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       name VARCHAR(100),
                       role VARCHAR(50)
);

INSERT INTO staff (username, password, name, role) VALUES
                                                       ('alicej', 'staff123', 'Alice Jensen', 'Ticket & Sales'),
                                                       ('bobh', 'staff123', 'Bob Hansen', 'Ticket & Sales'),
                                                       ('charlie', 'staff123', 'Charlie Madsen', 'Movie Operator'),
                                                       ('diana', 'staff123', 'Diana Nielsen', 'Inspector & Cleaning');

-- Vagtplan
DROP TABLE IF EXISTS roster;

CREATE TABLE roster (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        staff_id INT,
                        work_date DATE,
                        shift VARCHAR(20),
                        FOREIGN KEY (staff_id) REFERENCES staff(id)
);

INSERT INTO roster (staff_id, work_date, shift) VALUES
                                                    (1, '2025-02-01', 'Morning'),
                                                    (2, '2025-02-01', 'Evening'),
                                                    (3, '2025-02-01', 'Night'),
                                                    (4, '2025-02-02', 'Morning');

-- Slik
DROP TABLE IF EXISTS sweets;

CREATE TABLE sweets (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(50),
                        price DECIMAL(5,2)
);

INSERT INTO sweets (name, price) VALUES
                                     ('Popcorn', 45.00),
                                     ('Nachos', 40.00),
                                     ('Slikpose', 35.00),
                                     ('Sodavand', 25.00),
                                     ('Is', 30.00);