const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createAssignment,
  getCourseAssignments,
  getAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  gradeAssignment,
} = require("../controllers/assignmentController");

const router = express.Router();

// ==========================================
// CREATE ASSIGNMENT
// 🟢 INSTRUCTOR TOKEN
// ==========================================

router.post(
  "/create",
  protect,
  allowRoles("instructor"),
  createAssignment
);

// ==========================================
// GET COURSE ASSIGNMENTS
// 🟢 INSTRUCTOR / 🔵 STUDENT TOKEN
// ==========================================

router.get(
  "/course/:courseId",
  protect,
  getCourseAssignments
);

// ==========================================
// SUBMIT ASSIGNMENT
// 🔵 STUDENT TOKEN
// ==========================================

router.post(
  "/:assignmentId/submit",
  protect,
  allowRoles("student"),
  submitAssignment
);

// ==========================================
// GET SUBMISSIONS
// 🟢 INSTRUCTOR TOKEN
// ==========================================

router.get(
  "/:assignmentId/submissions",
  protect,
  allowRoles("instructor"),
  getAssignmentSubmissions
);

// ==========================================
// GRADE ASSIGNMENT
// 🟢 INSTRUCTOR TOKEN
// ==========================================

router.put(
  "/:assignmentId/grade",
  protect,
  allowRoles("instructor"),
  gradeAssignment
);

// ==========================================
// GET SINGLE ASSIGNMENT
// 🟢 INSTRUCTOR / 🔵 STUDENT TOKEN
// ==========================================

router.get(
  "/:assignmentId",
  protect,
  getAssignment
);

module.exports = router;