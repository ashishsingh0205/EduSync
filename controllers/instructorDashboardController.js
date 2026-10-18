const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");
const Review = require("../models/Review");

// ==========================================
// INSTRUCTOR DASHBOARD
// 🟢 INSTRUCTOR
// ==========================================

const getInstructorDashboard = async (req, res) => {
  try {
    // ------------------------------------------
    // 1. INSTRUCTOR COURSES
    // ------------------------------------------

    const courses = await Course.find({
      instructor: req.user.id,
    }).sort({ createdAt: -1 });

    const courseIds = courses.map((course) => course._id);

    // ------------------------------------------
    // 2. ENROLLMENTS
    // ------------------------------------------

    const enrollments = await Enrollment.find({
      course: { $in: courseIds },
    });

    // ------------------------------------------
    // 3. ASSIGNMENTS
    // ------------------------------------------

    const assignments = await Assignment.find({
      course: { $in: courseIds },
    });

    // ------------------------------------------
    // 4. QUIZZES
    // ------------------------------------------

    const quizzes = await Quiz.find({
      course: { $in: courseIds },
    });

    // ------------------------------------------
    // 5. REVIEWS
    // ------------------------------------------

    const reviews = await Review.find({
      course: { $in: courseIds },
    });

    // ------------------------------------------
    // 6. UNIQUE STUDENTS
    // ------------------------------------------

    const uniqueStudentIds = [
      ...new Set(
        enrollments.map((enrollment) =>
          enrollment.student.toString()
        )
      ),
    ];

    // ------------------------------------------
    // 7. AVERAGE RATING
    // ------------------------------------------

    let averageRating = 0;

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );

      averageRating = Number(
        (totalRating / reviews.length).toFixed(1)
      );
    }

    // ------------------------------------------
    // 8. COURSE-WISE STATISTICS
    // ------------------------------------------

    const courseStatistics = courses.map((course) => {
      const courseEnrollments = enrollments.filter(
        (enrollment) =>
          enrollment.course.toString() ===
          course._id.toString()
      );

      const courseAssignments = assignments.filter(
        (assignment) =>
          assignment.course.toString() ===
          course._id.toString()
      );

      const courseQuizzes = quizzes.filter(
        (quiz) =>
          quiz.course.toString() ===
          course._id.toString()
      );

      const courseReviews = reviews.filter(
        (review) =>
          review.course.toString() ===
          course._id.toString()
      );

      let courseAverageRating = 0;

      if (courseReviews.length > 0) {
        const totalRating = courseReviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );

        courseAverageRating = Number(
          (totalRating / courseReviews.length).toFixed(1)
        );
      }

      return {
        courseId: course._id,
        title: course.title,
        category: course.category,
        price: course.price,
        level: course.level,
        isPublished: course.isPublished,

        totalStudents: courseEnrollments.length,
        totalAssignments: courseAssignments.length,
        totalQuizzes: courseQuizzes.length,
        totalReviews: courseReviews.length,
        averageRating: courseAverageRating,
      };
    });

    // ------------------------------------------
    // 9. RESPONSE
    // ------------------------------------------

    res.json({
      message: "Instructor dashboard fetched successfully",

      statistics: {
        totalCourses: courses.length,
        totalStudents: uniqueStudentIds.length,
        totalAssignments: assignments.length,
        totalQuizzes: quizzes.length,
        totalReviews: reviews.length,
        averageRating,
      },

      courses: courseStatistics,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch instructor dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getInstructorDashboard,
};