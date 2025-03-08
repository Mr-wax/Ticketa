import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import Ticket from "../Models/TicketModel.js";
import { sendMailWithAttachment } from "../Utils/Mailer.js"; // Function to send email with attachment

/**
 * Generates a ticket with QR code and sends it via email.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateAndSendTicket = async (req, res) => {
  try {
    // 📌 Extract ticket details from request body
    const { event, buyer, email, phoneNumber, ticketType, date, time } = req.body;

    // 🎫 Generate a Unique Order Number
    const orderNumber = `TKT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 🔗 Generate QR Code (Includes Buyer Name + Order Number)
    const qrCodeData = `${buyer} - ${orderNumber}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrCodeData);

    // 📝 Create PDF Ticket
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const pdfPath = `./tickets/${orderNumber}.pdf`;
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // 🎨 Background Styling (Border Box)
    doc.rect(20, 20, 550, 800).stroke("#007BFF"); // Blue Border Box

    // 🔥 Ticketa Logo
    const logoPath = path.join("assets", "ticketa_logo.png"); // Ensure you have this logo in your project
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 220, 40, { width: 150 });
    }

    // 🎟️ Ticket Header
    doc
      .fontSize(26)
      .fillColor("#007BFF") // Blue header
      .text("Official Ticket", { align: "center" })
      .moveDown();

    // 📜 Ticket Details (Styled)
    doc
      .fontSize(18)
      .fillColor("#333") // Dark gray text
      .text(`Event: ${event}`, { align: "left" })
      .moveDown(0.5)
      .text(`Name: ${buyer}`, { align: "left" })
      .moveDown(0.5)
      .text(`Date: ${date}`, { align: "left" })
      .moveDown(0.5)
      .text(`Time: ${time}`, { align: "left" })
      .moveDown(0.5)
      .text(`Order Number: ${orderNumber}`, { align: "left" })
      .moveDown(1);

    // 🔲 QR Code with Border
    doc
      .rect(200, 500, 150, 150)
      .stroke("#007BFF"); // QR Code Border

    if (qrCodeBuffer) {
      doc.image(qrCodeBuffer, 205, 505, { width: 140, height: 140 });
    }

    // ✨ Footer Trademark
    doc
      .moveDown(2)
      .fontSize(12)
      .fillColor("#888") // Light gray text
      .text("Powered by Ticketa™ - Your Trusted Ticketing Platform", { align: "center" });

    doc.end();

    // 📩 After Writing PDF, Send Email
    writeStream.on("finish", async () => {
      try {
        // ✅ Save ticket to database
        const newTicket = new Ticket({
          event,
          buyer,
          email,
          phoneNumber,
          ticketType,
          date,
          time,
          orderNumber,
          qrCode: qrCodeBuffer,
          isPaid: true, // Assume paid, modify based on payment logic
        });
        await newTicket.save();

        // 📧 Send Email with PDF
        await sendMailWithAttachment(
          email,
          "Your Event Ticket 🎫",
          "Your ticket is attached as a PDF. Please present it at the event.",
          pdfPath
        );

        // 🟢 Success Response
        res.status(200).json({ message: "🎉 Ticket generated and sent successfully!" });
      } catch (error) {
        console.error("❌ Error sending email:", error);
        res.status(500).json({ message: "Failed to send ticket email." });
      }
    });
  } catch (error) {
    console.error("❌ Error generating ticket:", error);
    res.status(500).json({ message: "Failed to generate ticket." });
  }
};
