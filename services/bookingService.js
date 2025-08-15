import pool from "../database.js";
import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import { BOOKING_STATUS, ERROR_MESSAGES } from "../utils/constants.js";

class BookingService {
  static async createBooking({ showId, userId, seatsRequested }) {
    const client = await pool.connect();

    try {
      // Start transaction
      await client.query("BEGIN");

      // Set a high isolation level to prevent phantom reads
      await client.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");

      // Lock the show row to prevent concurrent modifications
      const lockQuery = "SELECT * FROM shows WHERE id = $1 FOR UPDATE";
      const showResult = await client.query(lockQuery, [showId]);

      if (showResult.rows.length === 0) {
        throw new Error(ERROR_MESSAGES.SHOW_NOT_FOUND);
      }

      const show = showResult.rows[0];

      // Check if enough seats are available
      if (show.available_seats < seatsRequested) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_SEATS);
      }

      // Calculate expiry time
      const expiryMinutes = parseInt(process.env.BOOKING_EXPIRY_MINUTES) || 2;
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      // Create booking record
      const booking = await Booking.create(
        {
          showId,
          userId,
          seatsRequested,
          expiresAt,
        },
        client
      );

      // Reduce available seats
      const updatedShow = await Show.updateAvailableSeats(
        showId,
        seatsRequested,
        client
      );

      if (!updatedShow) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_SEATS);
      }

      // Create seat lock record
      await this.createSeatLock(
        {
          showId,
          bookingId: booking.booking_id,
          seatsLocked: seatsRequested,
          expiresAt,
        },
        client
      );

      // Commit transaction
      await client.query("COMMIT");

      return booking;
    } catch (error) {
      // Rollback transaction on error
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async createSeatLock(
    { showId, bookingId, seatsLocked, expiresAt },
    client
  ) {
    try {
      const query = `
        INSERT INTO seat_locks (show_id, booking_id, seats_locked, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const values = [showId, bookingId, seatsLocked, expiresAt];
      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create seat lock: ${error.message}`);
    }
  }

  static async confirmBooking(bookingId) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Get booking details
      const booking = await Booking.findByBookingId(bookingId);

      if (!booking) {
        throw new Error(ERROR_MESSAGES.BOOKING_NOT_FOUND);
      }

      if (booking.status !== BOOKING_STATUS.PENDING) {
        throw new Error("Booking is not in pending status");
      }

      if (new Date() > new Date(booking.expires_at)) {
        throw new Error(ERROR_MESSAGES.BOOKING_EXPIRED);
      }

      // Update booking status to confirmed
      await Booking.updateStatus(bookingId, BOOKING_STATUS.CONFIRMED, client);

      // Remove seat lock
      await this.removeSeatLock(bookingId, client);

      await client.query("COMMIT");

      return { success: true, booking };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async removeSeatLock(bookingId, client) {
    try {
      const query = "DELETE FROM seat_locks WHERE booking_id = $1";
      await client.query(query, [bookingId]);
    } catch (error) {
      throw new Error(`Failed to remove seat lock: ${error.message}`);
    }
  }

  static async handleExpiredBookings() {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Find all expired bookings
      const expiredBookings = await Booking.findExpiredBookings();

      for (const booking of expiredBookings) {
        // Update booking status to failed
        await Booking.updateStatus(
          booking.booking_id,
          BOOKING_STATUS.FAILED,
          client
        );

        // Restore seats to show
        await Show.restoreSeats(
          booking.show_id,
          booking.seats_requested,
          client
        );

        // Remove seat locks
        await this.removeSeatLock(booking.booking_id, client);

        console.log(`Expired booking ${booking.booking_id} processed`);
      }

      await client.query("COMMIT");

      return expiredBookings.length;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error handling expired bookings:", error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export default BookingService;
