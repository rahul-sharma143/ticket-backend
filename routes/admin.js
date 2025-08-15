import express from "express";
import AdminController from "../controllers/adminController.js";
import { validateCreateShow } from "../middleware/validation.js";

const router = express.Router();

router.post("/shows", validateCreateShow, AdminController.createShow);
router.delete("/shows/:id", AdminController.deleteShow);
router.get("/shows", AdminController.getAllShows);
router.get("/bookings", AdminController.getAllBookings);

export default router;
