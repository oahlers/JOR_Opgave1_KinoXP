CREATE DATABASE schema;
USE kinoXP;

-- Theaters
CREATE TABLE theaters (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          name VARCHAR(50),
                          rows INT,
                          seats_per_row INT
);

INSERT INTO theaters (name, rows, seats_per_row) VALUES
                                                     ('Small Theater', 20, 12),
                                                     ('Large Theater', 25, 16);

-- Movies
CREATE TABLE movies (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(100),
                        category VARCHAR(50),
                        age_limit INT,
                        actors TEXT,
                        duration INT
);

-- Shows (a movie in a theater at a given time)
CREATE TABLE shows (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       movie_id INT,
                       theater_id INT,
                       show_time DATETIME,
                       FOREIGN KEY (movie_id) REFERENCES movies(id),
                       FOREIGN KEY (theater_id) REFERENCES theaters(id)
);

-- Bookings
CREATE TABLE bookings (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          show_id INT,
                          customer_name VARCHAR(100),
                          seats INT,
                          booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (show_id) REFERENCES shows(id)
);

-- Staff
CREATE TABLE staff (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(100),
                       role VARCHAR(50)
);

-- Staff Roster
CREATE TABLE roster (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        staff_id INT,
                        work_date DATE,
                        shift VARCHAR(20),
                        FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- Sweets
CREATE TABLE sweets (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(50),
                        price DECIMAL(5,2)
);
