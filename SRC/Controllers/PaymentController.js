import axios from "axios";
import dotenv from "dotenv";
import Ticket from "../Models/TicketModel.js";
import { generateAndSendTicket } from "../Controllers/TicketController.js"; // Use ticket generation after payment verification

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY; // 🔹 Declare Key Directly

/**
 * Initialize Paystack Payment
 */
export const initializePayment = async (req, res) => {
  try {
    const { email, amount, event, buyer, phoneNumber, ticketType, date, time } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Convert to kobo
        currency: "NGN",
        callback_url: `http://localhost:5000/api/payments/verify`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // ✅ Use Direct Key
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

    if (paymentData.status === "success") {
      const { email, amount, metadata } = paymentData;

      // Create and send ticket since payment is successful
      await generateAndSendTicket({
        body: {
          email,
          event: metadata.event,
          buyer: metadata.buyer,
          phoneNumber: metadata.phoneNumber,
          ticketType: metadata.ticketType,
          date: metadata.date,
          time: metadata.time,
        },
      });

      return res.status(200).json({ message: "Payment verified & ticket sent!" });
    } else {
      return res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error.response?.data || error.message);
    res.status(500).json({ message: "Payment verification failed" });
  }
};
