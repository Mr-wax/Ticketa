import express from "express";
import authRoutes from "./auth/Authroute.js"; // Import the correct route
import ticketRoutes from "./Ticket/TicketRoute.js";
import eventRoutes from "./event/eventRoute.js"

const router = express.Router(); // Fix capitalization

router.use("/auth", authRoutes); // Ensure you're using the correct variable name
router.use("/ticket", ticketRoutes)
router.use("/event", eventRoutes); // Ensure you're using the correct variable name

export default router;
