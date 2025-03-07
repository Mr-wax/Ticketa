import nodemailer from "nodemailer";

// Create Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ponmansukbyen@gmail.com",
    pass: "krdx mtka qpxy ljuu",
  },
});

// Send Email Function
export const sendMail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: "Ticketa",
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email not sent");
  }
};
