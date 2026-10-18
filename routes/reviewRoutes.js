const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const router = express.Router();

// ==========================================
// CREATE REVIEW
// 🔵 STUDENT TOKEN
// ==========================================

router.post(
  "/create",
  protect,
  allowRoles("student"),
  createReview
);

// ==========================================
// GET COURSE REVIEWS
// 🔵 STUDENT / 🟢 INSTRUCTOR TOKEN
// ==========================================

router.get(
  "/course/:courseId",
  protect,
  getCourseReviews
);

// ==========================================
// UPDATE REVIEW
// 🔵 STUDENT TOKEN
// ==========================================

router.put(
  "/:reviewId",
  protect,
  allowRoles("student"),
  updateReview
);

// ==========================================
// DELETE REVIEW
// 🔵 STUDENT TOKEN
// ==========================================

router.delete(
  "/:reviewId",
  protect,
  allowRoles("student"),
  deleteReview
);

module.exports = router;