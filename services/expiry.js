import cron from "node-cron";
import BookingService from "./bookingService.js";

class ExpiryService {
  static startExpiryCheck() {
    // Run every minute to check for expired bookings
    cron.schedule("* * * * *", async () => {
      try {
        const expiredCount = await BookingService.handleExpiredBookings();
        if (expiredCount > 0) {
          console.log(`Processed ${expiredCount} expired bookings`);
        }
      } catch (error) {
        console.error("Error in expiry check:", error);
      }
    });

    console.log("Booking expiry service started");
  }
}

export default ExpiryService;
