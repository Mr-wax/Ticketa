import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user:"ponmansukbyen@gmail.com",
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
      from: `"Ticketa" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: message, // Ensure this is 'html' and not 'text'
    });
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


export const sendMailWithAttachment = async (email, subject, text, filePath) => {
  try {
    const mailOptions = {
      from: `"Ticketa" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text,
      attachments: [{ filename: "Ticket.pdf", path: filePath }],
    };

    await transporter.sendMail(mailOptions);
    console.log("Email with ticket sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email not sent");
  } finally {
    // Cleanup: Delete the generated PDF after sending
    fs.unlinkSync(filePath);
  }
};
