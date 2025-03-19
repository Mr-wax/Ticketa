import express from "express";
import { protectRoute, adminOnly } from "../../Middlewares/ProtectRoute.js";
import { deleteUser, deleteEvent, getAllUsers, getAllEvents, getUserById } from "../../Controllers/AdminController.js";

const router = express.Router();

router.use(protectRoute, adminOnly); // Apply admin middleware

router.get("/users", protectRoute, adminOnly, getAllUsers);      // View all users
router.get("/events", protectRoute, getAllEvents);    // View all events
router.delete("/user/:id", protectRoute, adminOnly, deleteUser); // Delete a user
router.delete("/event/:id",protectRoute, deleteEvent); // Delete an event
router.get("/user/:id",protectRoute, getUserById);

export default router;
