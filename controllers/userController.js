import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import { ERROR_MESSAGES } from "../utils/constants.js";

class UserController {
  static async getAvailableShows(req, res) {
    try {
      const shows = await Show.findAvailable();

      res.json({
        success: true,
        data: shows,
      });
    } catch (error) {
      console.error("Error fetching available shows:", error);
      res.status(500).json({
        success: false,
        message: error.message || ERROR_MESSAGES.DATABASE_ERROR,
      });
    }
  }

  static async getUserBookings(req, res) {
    try {
      const userId = req.headers["user-id"] || "default-user";
      const bookings = await Booking.findByUserId(userId);

      res.json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({
        success: false,
        message: error.message || ERROR_MESSAGES.DATABASE_ERROR,
      });
    }
  }

  static async getShowDetails(req, res) {
    try {
      const { showId } = req.params;
      const show = await Show.findById(showId);

      if (!show) {
        return res.status(404).json({
          success: false,
          message: ERROR_MESSAGES.SHOW_NOT_FOUND,
        });
      }

      res.json({
        success: true,
        data: show,
      });
    } catch (error) {
      console.error("Error fetching show details:", error);
      res.status(500).json({
        success: false,
        message: error.message || ERROR_MESSAGES.DATABASE_ERROR,
      });
    }
  }
}

export default UserController;
