import express from "express";
import { createEvent, getUserEvents, updateEvent, deleteEvent } from "../../Controllers/EventController.js";
import protectRoute from "../../Middlewares/ProtectRoute.js"; // Ensure user is logged in
import { upload } from "../../Middlewares/ImageUpload.js";

const router = express.Router();

// Create an event (Only for registered users)
router.post("/create", protectRoute, upload.array("eventCoverPhotos", 5), createEvent);

// Get all events hosted by the logged-in user
router.get("/my-events", protectRoute, getUserEvents);

// Update an event (Only the creator can update)
router.put("/update/:eventId", protectRoute, updateEvent);

// Delete an event (Only the creator can delete)
router.delete("/delete/:eventId", protectRoute, deleteEvent);

export default router;
