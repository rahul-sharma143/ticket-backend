import Show from "../models/Show.js";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../utils/constants.js";

class AdminController {
  static async createShow(req, res) {
    try {
      console.log("Incoming body:", req.body);

      let { name, start_time, total_seats, price, type } = req.body;

      // ✅ Basic validation
      if (!name || !start_time || !total_seats || !price) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: name, start_time, total_seats, price",
        });
      }

      // ✅ Convert start_time to proper Date object
      const parsedDate = new Date(start_time);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start_time format",
        });
      }

      // ✅ Ensure seats & price are numbers
      total_seats = Number(total_seats);
      price = Number(price);

      if (isNaN(total_seats) || isNaN(price)) {
        return res.status(400).json({
          success: false,
          message: "total_seats and price must be numbers",
        });
      }

      // ✅ Optional: default type if not provided
      if (!type) {
        type = "show"; // default type
      }

      // ✅ Create show in DB
      const show = await Show.create({
        name,
        start_time: parsedDate,
        total_seats,
        price,
        type,
      });

      res.status(201).json({
        success: true,
        message: SUCCESS_MESSAGES.SHOW_CREATED || "Show created successfully",
        data: show,
      });
    } catch (error) {
      console.error("Error creating show:", error);
      res.status(500).json({
        success: false,
        message: error.message || ERROR_MESSAGES.DATABASE_ERROR,
      });
    }
  }
  static async deleteShow(req, res) {
    try {
      const showId = req.params.id;

      // Find show by ID
      const show = await Show.findById(showId);

      if (!show) {
        return res.status(404).json({
          success: false,
          message: "Show not found",
        });
      }

      // Delete the show
      await show.destroy();

      res.json({
        success: true,
        message: "Show deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting show:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  static async getAllShows(req, res) {
    try {
      const shows = await Show.findAll();
      res.json({ success: true, data: shows });
    } catch (error) {
      console.error("Error fetching shows:", error);
      res.status(500).json({
        success: false,
        message: error.message || ERROR_MESSAGES.DATABASE_ERROR,
      });
    }
  }
  static async getAllBookings(req, res) {
    try {
      // Example dummy data; replace with DB query
      const bookings = [
        { id: 1, user: "Rahul", seats: [1, 2], showId: 1 },
        { id: 2, user: "Amit", seats: [3, 4], showId: 1 },
      ];
      res.json({ success: true, data: bookings });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch bookings",
      });
    }
  }
}

export default AdminController;
