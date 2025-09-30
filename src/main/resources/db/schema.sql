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
                                                                ('61882812', 'jegelskerfilm', 'Sarah Black', 'sarahblack@example.com'),
                                                                ('12321255', 'jegelskerfilm', 'Anders Sørensen', 'anders@example.com'),
                                                                ('98756432', 'jegelskerfilm', 'Birgit Hansen', 'birgit@example.com'),
                                                                ('58736290', 'jegelskerfilm', 'Christian Nielsen', 'christian@example.com'),
                                                                ('87540912', 'jegelskerfilm', 'Daniel Pedersen', 'daniel@example.com'),
                                                                ('75649309', 'jegelskerfilm', 'Eva Kristensen', 'eva@example.com'),
                                                                ('76980012', 'jegelskerfilm', 'Frederik Madsen', 'frederik@example.com'),
                                                                ('76540011', 'jegelskerfilm', 'Grethe Jensen', 'grethe@example.com'),
                                                                ('65881233', 'jegelskerfilm', 'Henrik Larsen', 'henrik@example.com'),
                                                                ('84917688', 'jegelskerfilm', 'Ida Mortensen', 'ida@example.com'),
                                                                ('47120019', 'jegelskerfilm', 'Jakob Olsen', 'jakob@example.com'),
                                                                ('82018784', 'jegelskerfilm', 'Karina Johansen', 'karina@example.com'),
                                                                ('92800043', 'jegelskerfilm', 'Lars Petersen', 'lars@example.com'),
                                                                ('81875501', 'jegelskerfilm', 'Mia Andersen', 'mia@example.com'),
                                                                ('98002812', 'jegelskerfilm', 'Niels Thomsen', 'niels@example.com'),
                                                                ('74829954', 'jegelskerfilm', 'Ole Rasmussen', 'ole@example.com'),
                                                                ('12884377', 'jegelskerfilm', 'Pia Sørensen', 'pia@example.com'),
                                                                ('75821821', 'jegelskerfilm', 'Rene Kristensen', 'rene@example.com'),
                                                                ('82324401', 'jegelskerfilm', 'Sofie Hansen', 'sofie@example.com'),
                                                                ('77829943', 'jegelskerfilm', 'Thomas Madsen', 'thomas@example.com'),
                                                                ('84772123', 'jegelskerfilm', 'Ulrik Nielsen', 'ulrik@example.com');

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

-- Film (OPDATERET med nye felter)
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

INSERT INTO movie (title, category, age_limit, actors, duration, first_show_date, show_days, theater_id, ticket_price) VALUES
                                                                                                              ('Inception', 'Sci-Fi', 12, 'Leonardo DiCaprio, Marion Cotillard', 148, '2025-02-01', 7, 1, 95.00),
                                                                                                              ('The Dark Knight', 'Action', 15, 'Christian Bale, Heath Ledger', 152, '2025-02-01', 14, 2, 110.00),
                                                                                                              ('Pulp Fiction', 'Crime', 18, 'John Travolta, Uma Thurman', 154, '2025-02-01', 10, 1, 100.00),
                                                                                                              ('The Matrix', 'Sci-Fi', 15, 'Keanu Reeves, Laurence Fishburne', 136, '2025-02-03', 10, 2, 95.00),
                                                                                                              ('Forrest Gump', 'Drama', 11, 'Tom Hanks, Robin Wright', 142, '2025-02-04', 14, 1, 90.00);

-- Forestillinger
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
                                                        (1, 1, '2025-02-01 18:00:00'),
                                                        (1, 1, '2025-02-01 21:00:00'),
                                                        (2, 2, '2025-02-01 19:30:00'),
                                                        (3, 1, '2025-02-02 20:00:00'),
                                                        (4, 2, '2025-02-03 17:30:00'),
                                                        (4, 2, '2025-02-03 20:30:00'),
                                                        (5, 1, '2025-02-04 19:00:00'),
                                                        (5, 1, '2025-02-04 22:00:00'),
                                                        (1, 2, '2025-02-05 18:30:00'),
                                                        (2, 1, '2025-02-05 21:00:00');

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
                                                         (2, 'Birgit Hansen', 3),
                                                         (3, 'Christian Nielsen', 2),
                                                         (4, 'Daniel Pedersen', 5);

-- Personale (OPDATERET med nye felter)
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
                                                                             ('alicej', 'staff123', 'Alice Jensen', 'Ticket & Sales', 32.5),
                                                                             ('bobh', 'staff123', 'Bob Hansen', 'Ticket & Sales', 28.0),
                                                                             ('charlie', 'staff123', 'Charlie Madsen', 'Movie Operator', 40.0),
                                                                             ('diana', 'staff123', 'Diana Nielsen', 'Inspector & Cleaning', 36.0),
                                                                             ('emily', 'staff123', 'Emily Petersen', 'Manager', 45.5),
                                                                             ('frank', 'staff123', 'Frank Olsen', 'Security', 25.0);

-- Vagtplan (NY struktur med detaljerede vagter, kun tilladte vagttider)
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
                                                                                       (1, '2025-02-01', '13:00:00', '23:00:00', 'Day', 10.0),
                                                                                       (2, '2025-02-01', '13:00:00', '18:00:00', 'Half Day', 5.0),
                                                                                       (3, '2025-02-02', '18:00:00', '23:00:00', 'Evening', 5.0),
                                                                                       (4, '2025-02-02', '13:00:00', '23:00:00', 'Day', 10.0),
                                                                                       (5, '2025-02-03', '13:00:00', '18:00:00', 'Half Day', 5.0),
                                                                                       (6, '2025-02-03', '18:00:00', '23:00:00', 'Evening', 5.0);

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
                                     ('Is', 30.00),
                                     ('Chips', 20.00),
                                     ('Chokolade', 15.00),
                                     ('Kaffe', 18.00),
                                     ('The', 15.00),
                                     ('Mineralvand', 12.00);

-- Tilføj nye film for at teste kalenderen
INSERT INTO movie (title, category, age_limit, actors, duration, first_show_date, show_days, theater_id, ticket_price) VALUES
                                                                                                              ('Interstellar', 'Sci-Fi', 12, 'Matthew McConaughey, Anne Hathaway', 169, '2025-02-06', 10, 1, 105.00),
                                                                                                              ('The Godfather', 'Crime', 18, 'Marlon Brando, Al Pacino', 175, '2025-02-07', 14, 2, 120.00);
