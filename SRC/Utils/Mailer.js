import nodemailer from "nodemailer";
import fs from "fs";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user:process.env.EMAIL_USERNAME,
    pass:process.env.EMAIL_PASSWORD,
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
      from: `"Tixhub" <ponmansukbyen@gmail.com>`, // Ensure this matches the transporter user
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
          <p style="color: #333; font-size: 16px;">Thank you for purchasing your event ticket. Your ticket is attached as a PDF. Please bring this ticket to the event for verification</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Tixhub" <${process.env.EMAIL_USERNAME}>`,
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
