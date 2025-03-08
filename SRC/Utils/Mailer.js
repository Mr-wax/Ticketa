import nodemailer from "nodemailer";
import fs from "fs";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ponmansukbyen@gmail.com",
    pass: "krdx mtka qpxy ljuu",
  },
});

/**
 * Sends an email using nodemailer
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - Email message (supports both plain text and HTML)
 */
export const sendMail = async (to, subject, message) => {
  try {
    await transporter.sendMail({
      from: `"Ticketa" <ponmansukbyen@gmail.com>`, // Ensure this matches the transporter user
      to,
      subject,
      html: message, // Ensure this is 'html' and not 'text'
    });
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

/**
 * Sends an email with a ticket attachment
 * @param {string} email - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email body
 * @param {string} filePath - Path to the PDF file to attach
 */
export const sendMailWithAttachment = async (email, subject, text, filePath) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
        <div style="max-width: 600px; background: #fff; padding: 20px; margin: auto; border-radius: 8px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #007BFF; text-align: center;">🎟️ Your Ticket is Ready!</h2>
          <p style="color: #333; font-size: 16px;">Hello,</p>
          <p style="color: #333; font-size: 16px;">Thank you for purchasing your event ticket. Your ticket is attached as a PDF.</p>
          <p style="color: #333; font-size: 16px;">Event: <strong>Sample Event Name</strong></p>
          <p style="color: #333; font-size: 16px;">Date: <strong>Sample Date</strong></p>
          <p style="color: #333; font-size: 16px;">Location: <strong>Sample Venue</strong></p>
          <div style="text-align: center;">
            <a href="#" style="display: inline-block; background: #007BFF; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px; margin-top: 10px;">View Event Details</a>
          </div>
          <p style="text-align: center; font-size: 14px; color: #888; margin-top: 20px;">Need help? <a href="#" style="color: #007BFF; text-decoration: none;">Contact Support</a></p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Ticketa" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: htmlContent,
      attachments: [{ filename: "Ticket.pdf", path: filePath }],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email with ticket sent successfully!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Email not sent");
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ File deleted successfully: ${filePath}`);
    } else {
      console.warn(`⚠️ File already deleted or not found: ${filePath}`);
    }
  }
};
