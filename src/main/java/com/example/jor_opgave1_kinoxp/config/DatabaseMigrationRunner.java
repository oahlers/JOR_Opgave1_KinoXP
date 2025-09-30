package com.example.jor_opgave1_kinoxp.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            // Ensure the movie.image_url column exists (for older databases)
            Integer cnt = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'movie' AND COLUMN_NAME = 'image_url'",
                    Integer.class,
                    getSchemaName()
            );
            if (cnt == null || cnt == 0) {
                // MySQL 8 supports IF NOT EXISTS; do a simple add-attempt with IF NOT EXISTS for safety
                jdbcTemplate.execute("ALTER TABLE movie ADD COLUMN IF NOT EXISTS image_url VARCHAR(255)");
            }
        } catch (Exception e) {
            // Log and continue; we don't want startup to fail due to this optional migration
            System.err.println("[StartupMigration] Could not ensure movie.image_url column: " + e.getMessage());
        }

        // Ensure bookings.user_id exists and has FK to users(id)
        try {
            Integer colCnt = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'user_id'",
                    Integer.class,
                    getSchemaName()
            );
            if (colCnt == null || colCnt == 0) {
                jdbcTemplate.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id INT NULL");
            }
            // Check if FK exists
            Integer fkCnt = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'user_id' AND REFERENCED_TABLE_NAME = 'users'",
                    Integer.class,
                    getSchemaName()
            );
            if (fkCnt == null || fkCnt == 0) {
                try {
                    jdbcTemplate.execute("ALTER TABLE bookings ADD CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id)");
                } catch (Exception e2) {
                    System.err.println("[StartupMigration] Could not add FK bookings.user_id -> users.id: " + e2.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("[StartupMigration] Could not ensure bookings.user_id column/FK: " + e.getMessage());
        }

        // Ensure booking_sweets junction table exists with FKs to bookings and sweets
        try {
            Integer tableCnt = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'booking_sweets'",
                    Integer.class,
                    getSchemaName()
            );
            if (tableCnt == null || tableCnt == 0) {
                jdbcTemplate.execute(
                        "CREATE TABLE IF NOT EXISTS booking_sweets (" +
                                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                                "booking_id INT NOT NULL, " +
                                "sweet_id INT NOT NULL, " +
                                "quantity INT NOT NULL DEFAULT 1, " +
                                "price_each DECIMAL(5,2) NOT NULL, " +
                                "CONSTRAINT fk_bs_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE, " +
                                "CONSTRAINT fk_bs_sweet FOREIGN KEY (sweet_id) REFERENCES sweets(id)" +
                                ")"
                );
            }
        } catch (Exception e) {
            System.err.println("[StartupMigration] Could not ensure booking_sweets table: " + e.getMessage());
        }
    }

    // Extract the schema (database) name from the JDBC URL if possible; fallback to default kinoXP
    private String getSchemaName() {
        try {
            // This relies on the default DB name used in this project
            return jdbcTemplate.getDataSource().getConnection().getCatalog();
        } catch (Exception e) {
            return "kinoXP";
        }
    }
}
