
const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getAdminDashboard,
  getAllUsers,
  getAllCourses,
  updateUserRole,
  deleteUser,
} = require("../controllers/adminController");

const router = express.Router();

// All routes require admin authentication
router.use(protect, allowRoles("admin"));

// Admin dashboard
router.get("/dashboard", getAdminDashboard);

// Get all users
router.get("/users", getAllUsers);

// Get all courses
router.get("/courses", getAllCourses);

// Update user role
router.patch("/users/:userId/role", updateUserRole);

// Delete user
router.delete("/users/:userId", deleteUser);

module.exports = router;
