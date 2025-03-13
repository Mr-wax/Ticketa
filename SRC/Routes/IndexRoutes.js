import express from "express";
import authRoutes from "./auth/Authroute.js"; 
import ticketRoutes from "./Ticket/TicketRoute.js";
import eventRoutes from "./event/eventRoute.js"
import paymentRoutes from "./payment/paymenRoute.js"

const router = express.Router(); 

router.use("/auth", authRoutes); 
router.use("/ticket", ticketRoutes)
router.use("/event", eventRoutes); 
router.use("/payment", paymentRoutes); 
export default router;
