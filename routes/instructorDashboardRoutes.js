const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getInstructorDashboard,
} = require("../controllers/instructorDashboardController");

const router = express.Router();

// ==========================================
// INSTRUCTOR DASHBOARD
// 🟢 INSTRUCTOR TOKEN
// ==========================================

router.get(
  "/",
  protect,
  allowRoles("instructor"),
  getInstructorDashboard
);

module.exports = router;