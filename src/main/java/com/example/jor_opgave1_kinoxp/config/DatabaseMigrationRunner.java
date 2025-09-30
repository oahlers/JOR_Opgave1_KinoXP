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
