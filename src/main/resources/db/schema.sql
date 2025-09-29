-- Opret databasen
DROP DATABASE IF EXISTS kinoXP;
CREATE DATABASE kinoXP;
USE kinoXP;

-- Brugere
DROP TABLE IF EXISTS users;

CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       full_name VARCHAR(100),
                       email VARCHAR(100) UNIQUE,
                       phonenumber VARCHAR(15)
);

INSERT INTO users (username, password, full_name, email, phonenumber) VALUES
                                                                          ('sarahblack', 'jegelskerfilm', 'Sarah Black', 'sarahblack@example.com', '+4561882812'),
                                                                          ('anders', 'jegelskerfilm', 'Anders Sørensen', 'anders@example.com', '+4512321255'),
                                                                          ('birgit', 'jegelskerfilm', 'Birgit Hansen', 'birgit@example.com', '+4598756432'),
                                                                          ('christian', 'jegelskerfilm', 'Christian Nielsen', 'christian@example.com', '+4558736290'),
                                                                          ('daniel', 'jegelskerfilm', 'Daniel Pedersen', 'daniel@example.com', '+4587540912'),
                                                                          ('eva', 'jegelskerfilm', 'Eva Kristensen', 'eva@example.com', '+4575649309'),
                                                                          ('frederik', 'jegelskerfilm', 'Frederik Madsen', 'frederik@example.com', '+4576980012'),
                                                                          ('grethe', 'jegelskerfilm', 'Grethe Jensen', 'grethe@example.com', '+4576540011'),
                                                                          ('henrik', 'jegelskerfilm', 'Henrik Larsen', 'henrik@example.com', '+4565881233'),
                                                                          ('ida', 'jegelskerfilm', 'Ida Mortensen', 'ida@example.com', '+4584917688'),
                                                                          ('jakob', 'jegelskerfilm', 'Jakob Olsen', 'jakob@example.com', '+4547120019'),
                                                                          ('karina', 'jegelskerfilm', 'Karina Johansen', 'karina@example.com', '+4582018784'),
                                                                          ('lars', 'jegelskerfilm', 'Lars Petersen', 'lars@example.com', '+4592800043'),
                                                                          ('mia', 'jegelskerfilm', 'Mia Andersen', 'mia@example.com', '+4581875501'),
                                                                          ('niels', 'jegelskerfilm', 'Niels Thomsen', 'niels@example.com', '+4598002812'),
                                                                          ('ole', 'jegelskerfilm', 'Ole Rasmussen', 'ole@example.com', '+4574829954'),
                                                                          ('pia', 'jegelskerfilm', 'Pia Sørensen', 'pia@example.com', '+4512884377'),
                                                                          ('rene', 'jegelskerfilm', 'Rene Kristensen', 'rene@example.com', '+4575821821'),
                                                                          ('sofie', 'jegelskerfilm', 'Sofie Hansen', 'sofie@example.com', '+4582324401'),
                                                                          ('thomas', 'jegelskerfilm', 'Thomas Madsen', 'thomas@example.com', '+4577829943'),
                                                                          ('ulrik', 'jegelskerfilm', 'Ulrik Nielsen', 'ulrik@example.com', '+4584772123');

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

-- Personale
DROP TABLE IF EXISTS staff;

CREATE TABLE staff (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(100),
                       role VARCHAR(50)
);

INSERT INTO staff (name, role) VALUES
                                   ('Alice Jensen', 'Ticket & Sales'),
                                   ('Bob Hansen', 'Ticket & Sales'),
                                   ('Charlie Madsen', 'Movie Operator'),
                                   ('Diana Nielsen', 'Inspector & Cleaning');

-- Vagtplan
DROP TABLE IF EXISTS roster;

CREATE TABLE roster (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        staff_id INT,
                        work_date DATE,
                        shift VARCHAR(20),
                        FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- Slik
DROP TABLE IF EXISTS sweets;

CREATE TABLE sweets (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(50),
                        price DECIMAL(5,2)
);
