import fs from "fs";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import Ticket from "../Models/TicketModel.js";
import { sendMailWithAttachment } from "../Utils/Mailer.js"; // Function to send email with attachment

export const generateAndSendTicket = async (req, res) => {
  try {
    const { event, buyer, email, phoneNumber, ticketType, date, time } = req.body;

    const orderNumber = `TKT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrCodeData = `${buyer} - ${orderNumber}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrCodeData);

    // 📝 Properly Sized Ticket (A6 Landscape: 420 x 297 points)
    const doc = new PDFDocument({ size: "A6", layout: "landscape", margin: 20 });
    const pdfPath = `./tickets/${orderNumber}.pdf`;
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // 🎟️ Ticket Border (Ensures Proper Layout)
    doc.roundedRect(10, 10, 400, 277, 10).stroke("#007BFF");

    // 🎟️ Header (Centered & Spaced Correctly)
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#007BFF")
      .text("EVENT TICKET", { align: "center" })
      .moveDown(0.5);

    // 📜 Ticket Details (Fixed Alignment & Proper Spacing)
    doc
      .font("Helvetica")
      .fontSize(14)
      .fillColor("#222")
      .text(`Event: ${event}`, 40, 70)
      .text(`Name: ${buyer}`, 40, 100)
      .text(`Date: ${date}`, 40, 130)
      .text(`Time: ${time}`, 40, 160)
      .text(`Ticket Type: ${ticketType}`, 40, 190)
      .text(`Order No: ${orderNumber}`, 40, 220);

    // 📌 QR Code (Properly Placed)
    if (qrCodeBuffer) {
      doc.image(qrCodeBuffer, 300, 90, { width: 80, height: 80 });
    }

    // 🏆 Footer Branding
    doc
      .fontSize(12)
      .fillColor("#888")
      .text("Powered by Tixhub™", 150, 260);

    doc.end();

    // 📩 Handle PDF Writing Completion
    writeStream.on("finish", async () => {
      try {
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
          isPaid: true,
        });
        await newTicket.save();

        await sendMailWithAttachment(
          email,
          "Your Event Ticket",
          "Your ticket is attached as a PDF. Please present it at the event.",
          pdfPath
        );

        console.log("📩 Email with ticket sent successfully!");

        // 🗑️ Delete Ticket File After Sending
        if (fs.existsSync(pdfPath)) {
          fs.unlink(pdfPath, (err) => {
            if (err) console.error("❌ Error deleting file:", err);
            else console.log("🗑️ File deleted successfully:", pdfPath);
          });
        }

        if (res) {
          return res.status(200).json({ message: "🎉 Ticket generated and sent successfully!" });
        }
      } catch (error) {
        console.error("❌ Error sending email:", error);
        if (res) {
          return res.status(500).json({ message: "Failed to send ticket email." });
        }
      }
    });

  } catch (error) {
    console.error("❌ Error generating ticket:", error);
    if (res) {
      return res.status(500).json({ message: "Failed to generate ticket." });
    }
  }
};
