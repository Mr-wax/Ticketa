import express from "express";
import authRoutes from "./auth/Authroute.js"; // Import the correct route
import ticketRoutes from "./Ticket/TicketRoute.js";

const router = express.Router(); // Fix capitalization

router.use("/auth", authRoutes); // Ensure you're using the correct variable name
router.use("/ticket", ticketRoutes)

export default router;
