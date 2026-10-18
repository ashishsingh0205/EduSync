
const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createCourse,
  getMyCourses,
  updateCourse,
  deleteCourse,
  getPublishedCourses,
  getPublishedCourseById,
  toggleCoursePublish,
} = require("../controllers/courseController");

const router = express.Router();

// ==========================================
// PUBLIC ROUTES - NO TOKEN REQUIRED
// ==========================================

router.get("/published", getPublishedCourses);

router.get(
  "/published/:courseId",
  getPublishedCourseById
);

// ==========================================
// INSTRUCTOR ROUTES - INSTRUCTOR TOKEN
// ==========================================

router.post(
  "/create",
  protect,
  allowRoles("instructor"),
  createCourse
);

router.get(
  "/my-courses",
  protect,
  allowRoles("instructor"),
  getMyCourses
);

router.put(
  "/update/:id",
  protect,
  allowRoles("instructor"),
  updateCourse
);

router.delete(
  "/delete/:id",
  protect,
  allowRoles("instructor"),
  deleteCourse
);

router.patch(
  "/publish/:id",
  protect,
  allowRoles("instructor"),
  toggleCoursePublish
);

module.exports = router;
