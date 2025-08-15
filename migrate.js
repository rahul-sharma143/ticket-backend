import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const migrationFiles = [
    "001_create_shows.js",
    "002_create_bookings.js",
    "003_create_seat_locks.js",
  ];

  try {
    console.log("Starting database migrations...");

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      const sql = fs.readFileSync(filePath, "utf8");

      console.log(`Running migration: ${file}`);
      await pool.query(sql);
      console.log(`Migration ${file} completed`);
    }

    console.log("All migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
