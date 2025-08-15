import express from "express";
import BookingController from "../controllers/bookingController.js";
import {
  validateCreateBooking,
  validateBookingId,
} from "../middleware/validation.js";

const router = express.Router();

router.post("/", validateCreateBooking, BookingController.createBooking);
router.patch(
  "/:bookingId/confirm",
  validateBookingId,
  BookingController.confirmBooking
);

router.get(
  "/:bookingId",
  validateBookingId,
  BookingController.getBookingStatus
);

export default router;
