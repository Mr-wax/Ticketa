import Event from "../Models/EventModel.js";
import { cloudinary} from "../Middlewares/ImageUpload.js"; // ✅ Correct Import

export const createEvent = async (req, res) => {
  try {
    console.log("🟢 Request received:", req.body);
    console.log("🟢 Uploaded Files:", req.files);

    const { 
      eventName, 
      eventCategory, 
      eventDate, 
      eventTime, 
      duration, 
      refundPolicy, 
      eventDescription, 
      ticketPrice, 
      eventLocation, 
      eventCapacity 
    } = req.body;

    if (!eventName || !eventCategory || !eventDate || !eventTime || !eventDescription || !ticketPrice || !eventLocation || !eventCapacity) {
      console.error("🔴 Missing required fields!");
      return res.status(400).json({ message: "All required fields must be filled!" });
    }

    if (!req.files || req.files.length === 0) {
      console.error("🔴 No files uploaded!");
      return res.status(400).json({ message: "No event cover photos uploaded!" });
    }
    
    if (!req.files || req.files.length === 0) {
  return res.status(400).json({ message: "No event cover photos uploaded!" });
    }

    // 🔹 Upload Images to Cloudinary
    let uploadedImages = [];
    try {
      console.log("🟢 Uploading images to Cloudinary...");
      const uploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path, { folder: "ticketa_events" }));
      const results = await Promise.all(uploadPromises);
      uploadedImages = results.map(result => result.secure_url);
      console.log("🟢 Cloudinary Uploads:", uploadedImages);
    } catch (uploadError) {
      console.error("🔴 Cloudinary Upload Error:", uploadError);
      return res.status(500).json({ message: "Image upload failed!", error: uploadError.message });
    }

    // 🔹 Save Event to Database
    console.log("🟢 Saving event to database...");
    const event = new Event({
      postedBy: req.user._id,
      eventName,
      eventCategory,
      eventDate,
      eventTime,
      duration,
      eventCoverPhotos: uploadedImages,
      refundPolicy,
      eventDescription,
      ticketPrice,
      eventLocation,
      eventCapacity,
    });

    await event.save();
    console.log("✅ Event saved successfully!");
    res.status(201).json({ message: "Event created successfully!", event });

  } catch (error) {
    console.error("🔴 Error creating event:", error);
    res.status(500).json({ message: "Server error. Please try again.", error: error.message });
  }
};

/**
 * Get all events hosted by the logged-in user
 */
export const getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ postedBy: req.user._id });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update an event (Only the creator can update)
 */
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own events" });
    }

    Object.assign(event, req.body);
    await event.save();
    res.status(200).json({ message: "Event updated successfully!", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete an event (Only the creator can delete)
 */
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own events" });
    }

    await event.deleteOne();
    res.status(200).json({ message: "Event deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
