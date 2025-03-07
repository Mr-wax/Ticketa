import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateTicketPDF = async (ticketDetails) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const filePath = path.join("tickets", `ticket_${ticketDetails.ticketNumber}.pdf`);

    // Ensure tickets directory exists
    if (!fs.existsSync("tickets")) {
      fs.mkdirSync("tickets");
    }

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Add content to PDF
    doc.fontSize(20).text("Your Event Ticket", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text(`Event: ${ticketDetails.eventName}`);
    doc.text(`Ticket Number: ${ticketDetails.ticketNumber}`);
    doc.text(`Purchase Date: ${ticketDetails.purchaseDate}`);
    doc.text(`Name: ${ticketDetails.userName}`);
    doc.text(`Email: ${ticketDetails.email}`);
    doc.moveDown();
    doc.text("Please bring this ticket to the event for verification.", { align: "center" });

    doc.end();

    writeStream.on("finish", () => resolve(filePath));
    writeStream.on("error", reject);
  });
};
