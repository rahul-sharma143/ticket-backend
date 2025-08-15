import pool from "../database.js";
import { v4 as uuidv4 } from "uuid";
import { BOOKING_STATUS, ERROR_MESSAGES } from "../utils/constants.js";

class Booking {
  static async create(
    { showId, userId, seatsRequested, expiresAt },
    client = pool
  ) {
    try {
      const bookingId = uuidv4();
      const query = `
        INSERT INTO bookings (booking_id, show_id, user_id, seats_requested, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const values = [bookingId, showId, userId, seatsRequested, expiresAt];
      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.DATABASE_ERROR}: ${error.message}`);
    }
  }

  static async findByBookingId(bookingId) {
    try {
      const query = `
        SELECT b.*, s.name as show_name, s.start_time 
        FROM bookings b
        JOIN shows s ON b.show_id = s.id
        WHERE b.booking_id = $1
      `;
      const result = await pool.query(query, [bookingId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.DATABASE_ERROR}: ${error.message}`);
    }
  }

  static async findByUserId(userId) {
    try {
      const query = `
        SELECT b.*, s.name as show_name, s.start_time 
        FROM bookings b
        JOIN shows s ON b.show_id = s.id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.DATABASE_ERROR}: ${error.message}`);
    }
  }

  static async updateStatus(bookingId, status, client = pool) {
    try {
      const query = `
        UPDATE bookings 
        SET status = $1
        WHERE booking_id = $2
        RETURNING *
      `;
      const result = await client.query(query, [status, bookingId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.DATABASE_ERROR}: ${error.message}`);
    }
  }

  static async findExpiredBookings() {
    try {
      const query = `
        SELECT * FROM bookings 
        WHERE status = $1 AND expires_at < NOW()
      `;
      const result = await pool.query(query, [BOOKING_STATUS.PENDING]);
      return result.rows;
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.DATABASE_ERROR}: ${error.message}`);
    }
  }
}

export default Booking;
