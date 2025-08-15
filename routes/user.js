import express from "express";
import UserController from "../controllers/userController.js";

const router = express.Router();

router.get("/shows", UserController.getAvailableShows);
router.get("/bookings", UserController.getUserBookings);
router.get("/shows/:showId", UserController.getShowDetails);

export default router;
