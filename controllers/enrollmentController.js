
const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// Enroll Student in a Published Course
const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Validate course ID
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "A valid courseId is required",
      });
    }

    // Find course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Only published courses can be enrolled in
    if (course.isPublished !== true) {
      return res.status(400).json({
        message: "This course is not available for enrollment",
      });
    }

    // Prevent duplicate enrollment
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        message: "Already enrolled in this course",
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
    });

    return res.status(201).json({
      message: "Course enrolled successfully",
      enrollment,
    });
  } catch (error) {
    // Handle duplicate-key errors if a unique index exists
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Already enrolled in this course",
      });
    }

    console.error("Enrollment error:", error.message);

    return res.status(500).json({
      message: "Enrollment failed",
    });
  }
};

// Get My Enrolled Courses
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user.id,
    })
      .populate("course")
      .sort({ createdAt: -1 });

    return res.json({
      message: "Enrolled courses fetched successfully",
      enrollments,
    });
  } catch (error) {
    console.error("Fetch enrollments error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch enrolled courses",
    });
  }
};

module.exports = {
  enrollCourse,
  getMyEnrollments,
};
