import User from "../Models/UserModel.js";
import Event from "../Models/EventModel.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only!" });
    }

    const users = await User.find({});
    res.status(200).json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id).select("-password");
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    const totalEvents = events.length;

    res.status(200).json({
      message: `Fetched ${totalEvents} event(s) successfully.`,
      totalEvents,
      events,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again.", error: error.message });
  }
};


// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    await event.deleteOne();
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
