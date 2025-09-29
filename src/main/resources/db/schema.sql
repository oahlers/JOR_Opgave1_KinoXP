CREATE DATABASE schema;
USE kinoXP;

CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       full_name VARCHAR(100),
                       email VARCHAR(100) UNIQUE,
                       phonenumber VARCHAR(15),
                       role VARCHAR(20) DEFAULT 'CUSTOMER' -- fx CUSTOMER, ADMIN
);

INSERT INTO users (username, password, full_name, email, phonenumber, role) VALUES
    ('sarahblack', 'jegelskerfilm', 'Sarah Black', 'sarahblack@example.com', '+4561882812', 'CUSTOMER');

CREATE TABLE theaters (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          name VARCHAR(50),
                          rows INT,
                          seats_per_row INT
);

INSERT INTO theaters (name, rows, seats_per_row) VALUES
                                                     ('Small Theater', 20, 12),
                                                     ('Large Theater', 25, 16);

CREATE TABLE movies (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(100),
                        category VARCHAR(50),
                        age_limit INT,
                        actors TEXT,
                        duration INT
);

CREATE TABLE shows (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       movie_id INT,
                       theater_id INT,
                       show_time DATETIME,
                       FOREIGN KEY (movie_id) REFERENCES movies(id),
                       FOREIGN KEY (theater_id) REFERENCES theaters(id)
);


CREATE TABLE bookings (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          show_id INT,
                          customer_name VARCHAR(100),
                          seats INT,
                          booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (show_id) REFERENCES shows(id)
);

CREATE TABLE staff (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(100),
                       role VARCHAR(50)
);

CREATE TABLE roster (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        staff_id INT,
                        work_date DATE,
                        shift VARCHAR(20),
                        FOREIGN KEY (staff_id) REFERENCES staff(id)
);

CREATE TABLE sweets (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(50),
                        price DECIMAL(5,2)
);
