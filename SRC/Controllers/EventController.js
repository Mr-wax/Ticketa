import Event from "../Models/EventModel.js";

/**
 * Create a new event (Only for registered users)
 */
export const createEvent = async (req, res) => {
  try {
    const { eventName, eventCategory, eventDate, eventTime, duration, refundPolicy, eventDescription, ticketPrice, eventLocation, eventCapacity } = req.body;

    if (!eventName || !eventCategory || !eventDate || !eventTime || !eventDescription || !ticketPrice || !eventLocation || !eventCapacity) {
      return res.status(400).json({ message: "All required fields must be filled!" });
    }

    // 🔹 Log request files to check if multer is working
    console.log("Uploaded Files:", req.files);

    // 🔹 Upload Images to Cloudinary
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, { folder: "ticketa_events" });
          console.log("Cloudinary Upload Result:", result); // Log Cloudinary response
          uploadedImages.push(result.secure_url);
        } catch (error) {
          console.error("Cloudinary Upload Error:", error);
        }
      }
    } else {
      console.warn("No images found in request.");
    }

    // 🔹 Create Event in Database
    const event = new Event({
      postedBy: req.user._id,
      eventName,
      eventCategory,
      eventDate,
      eventTime,
      duration,
      eventCoverPhotos: uploadedImages, // Store image URLs
      refundPolicy,
      eventDescription,
      ticketPrice,
      eventLocation,
      eventCapacity,
    });

    await event.save();
    res.status(201).json({ message: "Event created successfully!", event });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: error.message });
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
