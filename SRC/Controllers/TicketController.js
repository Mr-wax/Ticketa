import Ticket from "../Models/TicketModel.js";
import { sendMailWithAttachment } from "../Utils/Mailer.js";
import { generateTicketPDF } from "../Utils/GenerateTickets.js";

export const purchaseTicket = async (req, res) => {
  try {
    const { eventName, email, userName } = req.body;

    // Generate unique ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Save ticket in the database
    const ticket = await Ticket.create({ eventName, email, ticketNumber, userName });

    // Generate PDF
    const pdfPath = await generateTicketPDF(ticket);

    // Send email with ticket PDF
    await sendMailWithAttachment(email, "Your Event Ticket", "Please find your ticket attached.", pdfPath);

    res.status(200).json({ message: "Ticket purchased successfully. Check your email for the ticket." });
  } catch (error) {
    console.error("Error purchasing ticket:", error);
    res.status(500).json({ message: "Error processing ticket purchase." });
  }
};
