
const mongoose = require("mongoose");

const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const Section = require("../models/Section");
const Enrollment = require("../models/Enrollment");

// ==========================================
// CREATE ASSIGNMENT
// 🟢 INSTRUCTOR TOKEN
// ==========================================

const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      course,
      section,
      dueDate,
      totalMarks,
    } = req.body;

    if (!title || !title.trim() || !course || !section) {
      return res.status(400).json({
        message: "Title, course and section are required",
      });
    }

    if (
      !mongoose.isValidObjectId(course) ||
      !mongoose.isValidObjectId(section)
    ) {
      return res.status(400).json({
        message: "Invalid course or section ID",
      });
    }

    if (
      totalMarks !== undefined &&
      (!Number.isFinite(Number(totalMarks)) ||
        Number(totalMarks) <= 0)
    ) {
      return res.status(400).json({
        message: "Total marks must be a positive number",
      });
    }

    if (dueDate && Number.isNaN(Date.parse(dueDate))) {
      return res.status(400).json({
        message: "Invalid due date",
      });
    }

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (existingCourse.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not the instructor of this course",
      });
    }

    const existingSection = await Section.findById(section);

    if (!existingSection) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    if (existingSection.course.toString() !== course) {
      return res.status(400).json({
        message: "Section does not belong to this course",
      });
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      description: description || "",
      course,
      section,
      dueDate: dueDate || null,
      totalMarks:
        totalMarks === undefined ? 100 : Number(totalMarks),
    });

    return res.status(201).json({
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Assignment creation failed",
      error: error.message,
    });
  }
};

// ==========================================
// GET COURSE ASSIGNMENTS
// 🟢 INSTRUCTOR / 🔵 STUDENT TOKEN
// ==========================================

const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Students must be enrolled in the course.
    if (req.user.role === "student") {
      if (!course.isPublished) {
        return res.status(403).json({
          message: "This course is not published",
        });
      }

      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: courseId,
      });

      if (!enrollment) {
        return res.status(403).json({
          message: "You are not enrolled in this course",
        });
      }
    } else if (
      req.user.role === "instructor" &&
      course.instructor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You are not the instructor of this course",
      });
    } else if (
      req.user.role !== "student" &&
      req.user.role !== "instructor"
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const assignments = await Assignment.find({
      course: courseId,
    })
      .select(
        "title description course section dueDate totalMarks createdAt"
      )
      .sort({ createdAt: -1 });

    return res.json({
      message: "Assignments fetched successfully",
      assignments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE ASSIGNMENT
// 🟢 INSTRUCTOR / 🔵 STUDENT TOKEN
// ==========================================

const getAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!mongoose.isValidObjectId(assignmentId)) {
      return res.status(400).json({
        message: "Invalid assignment ID",
      });
    }

    const assignment = await Assignment.findById(assignmentId).select(
      "title description course section dueDate totalMarks createdAt"
    );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const course = await Course.findById(assignment.course);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (req.user.role === "student") {
      if (!course.isPublished) {
        return res.status(403).json({
          message: "This course is not published",
        });
      }

      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: assignment.course,
      });

      if (!enrollment) {
        return res.status(403).json({
          message: "You are not enrolled in this course",
        });
      }
    } else if (
      req.user.role === "instructor" &&
      course.instructor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You are not the instructor of this course",
      });
    } else if (
      req.user.role !== "student" &&
      req.user.role !== "instructor"
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    return res.json({
      message: "Assignment fetched successfully",
      assignment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch assignment",
      error: error.message,
    });
  }
};

// ==========================================
// SUBMIT ASSIGNMENT
// 🔵 STUDENT TOKEN
// ==========================================

const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { answer } = req.body;

    if (!mongoose.isValidObjectId(assignmentId)) {
      return res.status(400).json({
        message: "Invalid assignment ID",
      });
    }

    if (typeof answer !== "string" || !answer.trim()) {
      return res.status(400).json({
        message: "Please provide your assignment answer",
      });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const course = await Course.findById(assignment.course);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (!course.isPublished) {
      return res.status(403).json({
        message: "This course is not published",
      });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: assignment.course,
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You are not enrolled in this course",
      });
    }

    if (
      assignment.dueDate &&
      new Date() > new Date(assignment.dueDate)
    ) {
      return res.status(400).json({
        message: "Assignment submission deadline has passed",
      });
    }

    const alreadySubmitted = assignment.submissions.some(
      (submission) =>
        submission.student.toString() === req.user.id
    );

    if (alreadySubmitted) {
      return res.status(400).json({
        message: "You have already submitted this assignment",
      });
    }

    assignment.submissions.push({
      student: req.user.id,
      answer: answer.trim(),
    });

    await assignment.save();

    return res.status(201).json({
      message: "Assignment submitted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Assignment submission failed",
      error: error.message,
    });
  }
};

// ==========================================
// GET ASSIGNMENT SUBMISSIONS
// 🟢 INSTRUCTOR TOKEN
// ==========================================

const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!mongoose.isValidObjectId(assignmentId)) {
      return res.status(400).json({
        message: "Invalid assignment ID",
      });
    }

    const assignment = await Assignment.findById(assignmentId)
      .populate("submissions.student", "name email");

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const course = await Course.findById(assignment.course);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not the instructor of this course",
      });
    }

    return res.json({
      message: "Assignment submissions fetched successfully",
      submissions: assignment.submissions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};

// ==========================================
// GRADE ASSIGNMENT
// 🟢 INSTRUCTOR TOKEN
// ==========================================

const gradeAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { studentId, marks, feedback } = req.body;

    if (!mongoose.isValidObjectId(assignmentId)) {
      return res.status(400).json({
        message: "Invalid assignment ID",
      });
    }

    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        message: "Valid student ID is required",
      });
    }

    if (
      marks === undefined ||
      marks === null ||
      marks === "" ||
      !Number.isFinite(Number(marks))
    ) {
      return res.status(400).json({
        message: "Marks must be a valid number",
      });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const course = await Course.findById(assignment.course);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not the instructor of this course",
      });
    }

    const numericMarks = Number(marks);

    if (numericMarks < 0 || numericMarks > assignment.totalMarks) {
      return res.status(400).json({
        message: `Marks must be between 0 and ${assignment.totalMarks}`,
      });
    }

    const submission = assignment.submissions.find(
      (item) => item.student.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({
        message: "Student submission not found",
      });
    }

    submission.marks = numericMarks;
    submission.feedback =
      typeof feedback === "string" ? feedback.trim() : "";
    submission.status = "graded";

    await assignment.save();

    return res.json({
      message: "Assignment graded successfully",
      submission,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to grade assignment",
      error: error.message,
    });
  }
};

module.exports = {
  createAssignment,
  getCourseAssignments,
  getAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  gradeAssignment,
};
