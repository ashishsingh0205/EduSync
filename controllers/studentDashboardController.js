const Enrollment = require("../models/Enrollment");
const QuizAttempt = require("../models/QuizAttempt");
const Assignment = require("../models/Assignment");

// ==========================================
// STUDENT DASHBOARD
// 🔵 STUDENT
// ==========================================

const getStudentDashboard = async (req, res) => {
  try {
    // ------------------------------------------
    // 1. ENROLLED COURSES
    // ------------------------------------------

    const enrollments = await Enrollment.find({
      student: req.user.id,
    })
      .populate(
        "course",
        "title description category price level thumbnail"
      )
      .sort({ createdAt: -1 });

    // ------------------------------------------
    // 2. QUIZ ATTEMPTS
    // ------------------------------------------

    const quizAttempts = await QuizAttempt.find({
      student: req.user.id,
    })
      .populate("quiz", "title passingScore")
      .sort({ createdAt: -1 });

    // ------------------------------------------
    // 3. ASSIGNMENT STATUS
    // ------------------------------------------

    const assignments = await Assignment.find({
      "submissions.student": req.user.id,
    }).select(
      "title course totalMarks dueDate submissions"
    );

    const assignmentStatus = assignments.map((assignment) => {
      const submission = assignment.submissions.find(
        (submission) =>
          submission.student.toString() === req.user.id
      );

      return {
        assignmentId: assignment._id,
        title: assignment.title,
        course: assignment.course,
        totalMarks: assignment.totalMarks,
        dueDate: assignment.dueDate,
        status: submission?.status || "not submitted",
        marks: submission?.marks ?? null,
        feedback: submission?.feedback || "",
      };
    });

    // ------------------------------------------
    // 4. STATISTICS
    // ------------------------------------------

    const totalCourses = enrollments.length;

    const completedCourses = enrollments.filter(
      (enrollment) => enrollment.completed
    ).length;

    const totalQuizAttempts = quizAttempts.length;

    let averageQuizScore = 0;

    if (quizAttempts.length > 0) {
      const totalScore = quizAttempts.reduce(
        (sum, attempt) => sum + attempt.score,
        0
      );

      averageQuizScore = Math.round(
        totalScore / quizAttempts.length
      );
    }

    // ------------------------------------------
    // 5. RESPONSE
    // ------------------------------------------

    res.json({
      message: "Student dashboard fetched successfully",

      statistics: {
        totalCourses,
        completedCourses,
        totalQuizAttempts,
        averageQuizScore,
      },

      enrolledCourses: enrollments,

      quizAttempts,

      assignments: assignmentStatus,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getStudentDashboard,
};