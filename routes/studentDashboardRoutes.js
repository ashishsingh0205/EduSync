const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getStudentDashboard,
} = require("../controllers/studentDashboardController");

const router = express.Router();

// ==========================================
// STUDENT DASHBOARD
// 🔵 STUDENT TOKEN
// ==========================================

router.get(
  "/",
  protect,
  allowRoles("student"),
  getStudentDashboard
);

module.exports = router;