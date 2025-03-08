import express from "express";
import { generateAndSendTicket } from "../../Controllers/TicketController.js";

const router = express.Router();

// Route to generate ticket and send as email
router.post("/generate-ticket", generateAndSendTicket);

export default router;
