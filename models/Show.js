import pool from "../database.js";
import { ERROR_MESSAGES } from "../utils/constants.js";

class Show {
  static async create({ name, start_time, total_seats, price, type = "show" }) {
    try {
      const query = `
      INSERT INTO shows (name, start_time, total_seats, available_seats, price, type)
      VALUES ($1, $2, $3, $3, $4, $5)
      RETURNING *
    `;
      const values = [name, start_time, total_seats, price, type];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.DATABASE_ERROR}: ${error.message}`);
    }
  }
  static async deleteById(id) {
    try {
      const query = `DELETE FROM shows WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.DATABASE_ERROR}: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const query = "SELECT * FROM shows ORDER BY start_time ASC";
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.DATABASE_ERROR}: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const query = "SELECT * FROM shows WHERE id = $1";
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.DATABASE_ERROR}: ${error.message}`);
    }
  }

  static async findAvailable() {
    try {
      const query = `
        SELECT * FROM shows 
        WHERE available_seats > 0 AND start_time > NOW()
        ORDER BY start_time ASC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.DATABASE_ERROR}: ${error.message}`);
    }
  }

  static async updateAvailableSeats(showId, seatsToReduce, client = pool) {
    try {
      const query = `
        UPDATE shows 
        SET available_seats = available_seats - $1
        WHERE id = $2 AND available_seats >= $1
        RETURNING *
      `;
      const result = await client.query(query, [seatsToReduce, showId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.DATABASE_ERROR}: ${error.message}`);
    }
  }

  static async restoreSeats(showId, seatsToRestore, client = pool) {
    try {
      const query = `
        UPDATE shows 
        SET available_seats = available_seats + $1
        WHERE id = $2
        RETURNING *
      `;
      const result = await client.query(query, [seatsToRestore, showId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.DATABASE_ERROR}: ${error.message}`);
    }
  }
}

export default Show;
