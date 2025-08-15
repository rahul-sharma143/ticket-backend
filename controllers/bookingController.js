import BookingService from "../services/bookingService.js";
import Booking from "../models/Booking.js";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../utils/constants.js";

class BookingController {
  static async createBooking(req, res) {
    try {
      const { showId, seatsRequested } = req.body;
      const userId = req.headers["user-id"] || `user-${Date.now()}`;

      const booking = await BookingService.createBooking({
        showId,
        userId,
        seatsRequested,
      });

      res.status(201).json({
        success: true,
        message: SUCCESS_MESSAGES.BOOKING_CREATED,
        data: {
          bookingId: booking.booking_id,
          showId: booking.show_id,
          seatsRequested: booking.seats_requested,
          status: booking.status,
          expiresAt: booking.expires_at,
        },
      });
    } catch (error) {
      console.error("Error creating booking:", error);

      let statusCode = 500;
      if (error.message.includes("not found")) statusCode = 404;
      if (error.message.includes("Insufficient")) statusCode = 400;

      res.status(statusCode).json({
        success: false,
        message: error.message || ERROR_MESSAGES.DATABASE_ERROR,
      });
    }
  }

  static async confirmBooking(req, res) {
    try {
      const { bookingId } = req.params;

      const result = await BookingService.confirmBooking(bookingId);

      res.json({
        success: true,
        message: SUCCESS_MESSAGES.BOOKING_CONFIRMED,
        data: result.booking,
      });
    } catch (error) {
      console.error("Error confirming booking:", error);

      let statusCode = 500;
      if (error.message.includes("not found")) statusCode = 404;
      if (
        error.message.includes("expired") ||
        error.message.includes("not in pending")
      )
        statusCode = 400;

      res.status(statusCode).json({
        success: false,
        message: error.message || ERROR_MESSAGES.DATABASE_ERROR,
      });
    }
  }

  static async getBookingStatus(req, res) {
    try {
      const { bookingId } = req.params;

      const booking = await Booking.findByBookingId(bookingId);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: ERROR_MESSAGES.BOOKING_NOT_FOUND,
        });
      }

      res.json({
        success: true,
        data: booking,
      });
    } catch (error) {
      console.error("Error fetching booking status:", error);
      res.status(500).json({
        success: false,
        message: error.message || ERROR_MESSAGES.DATABASE_ERROR,
      });
    }
  }
}

export default BookingController;
