import axios from "axios";
import dotenv from "dotenv";
import Ticket from "../Models/TicketModel.js";
import { generateAndSendTicket } from "../Controllers/TicketController.js"; // Use ticket generation after payment verification

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY; // 🔹 Declare Key Directly

/**
 * Initialize Paystack Payment
 */export const initializePayment = async (req, res) => {
  try {
    const { email, amount, event, buyer, phoneNumber, ticketType, date, time } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Convert to kobo
        currency: "NGN",
        callback_url: `http://localhost:5000/api/payments/verify`,
        metadata: {  // ✅ Ensure metadata is correctly structured
          email,
          event,
          buyer,
          phoneNumber,
          ticketType,
          date,
          time,
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // ✅ Ensure correct secret key
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      message: "Payment initialized",
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference,
    });
  } catch (error) {
    console.error("Error initializing payment:", error.response?.data || error.message);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};


/**
 * Verify Paystack Payment
 */
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const paymentData = response.data.data;
    console.log("✅ Paystack Response Data:", paymentData); // Debugging

    if (paymentData.status === "success") {
      const metadata = paymentData.metadata;

      if (!metadata) {
        console.error("❌ Metadata is missing in Paystack response");
        return res.status(400).json({ message: "Payment metadata is missing. Cannot generate ticket." });
      }

      const { email, event, buyer, phoneNumber, ticketType, date, time } = metadata;

      if (!email) {
        console.error("❌ Email is missing in metadata");
        return res.status(400).json({ message: "Email is required to generate a ticket" });
      }

      // ✅ Pass res to ensure response is sent correctly
      await generateAndSendTicket(
        { body: { email, event, buyer, phoneNumber, ticketType, date, time } },
        res
      );

    } else {
      return res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("❌ Error verifying payment:", error.response?.data || error.message);
    res.status(500).json({ message: "Payment verification failed" });
  }
};
