const Review = require("../models/Review");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// ==========================================
// CREATE REVIEW
// 🔵 STUDENT
// ==========================================

const createReview = async (req, res) => {
  try {
    const { course, rating, comment } = req.body;

    // Check course
    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course,
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You must be enrolled in this course to review it",
      });
    }

    // Check existing review
    const existingReview = await Review.findOne({
      student: req.user.id,
      course,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this course",
      });
    }

    const review = await Review.create({
      student: req.user.id,
      course,
      rating,
      comment,
    });

    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    // Duplicate index protection
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this course",
      });
    }

    res.status(500).json({
      message: "Review creation failed",
      error: error.message,
    });
  }
};

// ==========================================
// GET COURSE REVIEWS
// 🟢 INSTRUCTOR / 🔵 STUDENT
// ==========================================

const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await Review.find({
      course: courseId,
    })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    // Calculate average rating
    let averageRating = 0;

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );

      averageRating = (
        totalRating / reviews.length
      ).toFixed(1);
    }

    res.json({
      message: "Course reviews fetched successfully",
      totalReviews: reviews.length,
      averageRating: Number(averageRating),
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch course reviews",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE REVIEW
// 🔵 STUDENT
// ==========================================

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({
      _id: reviewId,
      student: req.user.id,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    if (rating !== undefined) {
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    res.json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Review update failed",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE REVIEW
// 🔵 STUDENT
// ==========================================

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({
      _id: reviewId,
      student: req.user.id,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    await Review.deleteOne({
      _id: reviewId,
    });

    res.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Review deletion failed",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
};