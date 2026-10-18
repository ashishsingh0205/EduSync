const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createLesson,
  getSectionLessons,
  completeLesson,
} = require("../controllers/lessonController");

const router = express.Router();

// Create Lesson
router.post(
  "/create",
  protect,
  allowRoles("instructor"),
  createLesson
);

// Get Lessons of a Section
router.get(
  "/section/:sectionId",
  protect,
  getSectionLessons
);

// Complete Lesson
router.post(
  "/complete",
  protect,
  allowRoles("student"),
  completeLesson
);

module.exports = router;