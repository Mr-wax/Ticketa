import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: false,
  },
  buyer: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    index: true, // Optimizes lookup
  },
  phoneNumber: {
    type: String,
  },
  ticketType: {
    type: String,
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  qrCode: {
    type: Buffer, // Stores QR code as an image buffer
  },
  eventDetails: {
    type: Object,
  },
  date: {
    type: Date, // Use Date for proper sorting
    required: true,
  },
  time: {
    type: String, // If storing only HH:MM format
  },
  location: {
    type: String,
  },
  pdfbytes: {
    type: Buffer, // Stores the ticket PDF file
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
