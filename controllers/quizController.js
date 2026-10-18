
const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const Course = require("../models/Course");
const Section = require("../models/Section");
const Enrollment = require("../models/Enrollment");
const QuizAttempt = require("../models/QuizAttempt");

// CREATE QUIZ - Instructor only
const createQuiz = async (req, res) => {
  try {
    const { title, courseId, sectionId, questions, passingScore } = req.body;

    if (
      !title ||
      !courseId ||
      !sectionId ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        message: "Title, course, section and questions are required",
      });
    }

    if (
      !mongoose.isValidObjectId(courseId) ||
      !mongoose.isValidObjectId(sectionId)
    ) {
      return res.status(400).json({
        message: "Invalid course or section ID",
      });
    }

    if (
      passingScore !== undefined &&
      (!Number.isFinite(Number(passingScore)) ||
        Number(passingScore) < 0 ||
        Number(passingScore) > 100)
    ) {
      return res.status(400).json({
        message: "Passing score must be between 0 and 100",
      });
    }

    for (const question of questions) {
      if (
        !question.question ||
        !Array.isArray(question.options) ||
        question.options.length < 2 ||
        typeof question.correctAnswer !== "string" ||
        !question.options.includes(question.correctAnswer)
      ) {
        return res.status(400).json({
          message:
            "Each question needs text, at least two options, and a correctAnswer matching one option's text",
        });
      }
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only create quizzes for your own courses",
      });
    }

    const section = await Section.findById(sectionId);

    if (!section || section.course.toString() !== courseId) {
      return res.status(404).json({
        message: "Section not found in this course",
      });
    }

    const quiz = await Quiz.create({
      title: title.trim(),
      course: courseId,
      section: sectionId,
      questions,
      passingScore:
        passingScore === undefined ? 50 : Number(passingScore),
    });

    return res.status(201).json({
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    return res.status(500).json({
      message: "Failed to create quiz",
    });
  }
};

// GET QUIZ
const getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!mongoose.isValidObjectId(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    const quiz = await Quiz.findById(quizId).lean();

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const course = await Course.findById(quiz.course);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (req.user.role === "instructor") {
      if (course.instructor.toString() !== req.user.id) {
        return res.status(403).json({
          message: "You cannot access this quiz",
        });
      }

      return res.status(200).json({ quiz });
    }

    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (!course.isPublished) {
      return res.status(403).json({
        message: "This course is not published",
      });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: quiz.course,
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "Enroll in this course to access the quiz",
      });
    }

    // Hide correct answers from students.
    const safeQuiz = {
      ...quiz,
      questions: quiz.questions.map((question) => {
        const { correctAnswer, ...safeQuestion } = question;
        return safeQuestion;
      }),
    };

    return res.status(200).json({ quiz: safeQuiz });
  } catch (error) {
    console.error("Get quiz error:", error);
    return res.status(500).json({
      message: "Failed to fetch quiz",
    });
  }
};

// SUBMIT QUIZ - Student only
const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    if (!mongoose.isValidObjectId(quizId)) {
      return res.status(400).json({
        message: "Invalid quiz ID",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        message: "Answers must be provided as an array",
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    const course = await Course.findById(quiz.course);

    if (!course || !course.isPublished) {
      return res.status(403).json({
        message: "This course is not available",
      });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: quiz.course,
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "Enroll in this course before submitting the quiz",
      });
    }

    if (!quiz.questions.length) {
      return res.status(400).json({
        message: "This quiz has no questions",
      });
    }

    // Validate answers before calculating the score.
    const submittedQuestionIds = new Set();

    for (const answer of answers) {
      if (
        !answer.questionId ||
        !mongoose.isValidObjectId(answer.questionId) ||
        !Number.isInteger(answer.answer)
      ) {
        return res.status(400).json({
          message:
            "Each answer must contain a valid questionId and answer index",
        });
      }

      const questionId = answer.questionId.toString();

      if (submittedQuestionIds.has(questionId)) {
        return res.status(400).json({
          message: "Duplicate answers for a question are not allowed",
        });
      }

      submittedQuestionIds.add(questionId);

      const question = quiz.questions.find(
        (item) => item._id.toString() === questionId
      );

      if (!question) {
        return res.status(400).json({
          message: "Question does not belong to this quiz",
        });
      }

      if (
        answer.answer < 0 ||
        answer.answer >= question.options.length
      ) {
        return res.status(400).json({
          message: "Answer index is out of range",
        });
      }
    }

    // Calculate score using the selected option's text.
    let correctAnswers = 0;

    for (const question of quiz.questions) {
      const submittedAnswer = answers.find(
        (answer) =>
          answer.questionId.toString() === question._id.toString()
      );

      if (!submittedAnswer) {
        continue;
      }

      const selectedOption = question.options[submittedAnswer.answer];

      if (
        selectedOption.trim() === question.correctAnswer.trim()
      ) {
        correctAnswers++;
      }
    }

    const totalQuestions = quiz.questions.length;
    const score = Math.round(
      (correctAnswers / totalQuestions) * 100
    );
    const passingScore = quiz.passingScore ?? 50;
    const passed = score >= passingScore;

    const attempt = await QuizAttempt.create({
      student: req.user.id,
      quiz: quiz._id,
      totalQuestions,
      correctAnswers,
      score,
      passingScore,
      passed,
    });

    return res.status(201).json({
      message: "Quiz submitted successfully",
      result: {
        totalQuestions,
        correctAnswers,
        score,
        passingScore,
        passed,
      },
      attempt,
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    return res.status(500).json({
      message: "Failed to submit quiz",
    });
  }
};

// GET CURRENT STUDENT'S QUIZ ATTEMPTS
const getMyQuizAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      student: req.user.id,
    })
      .populate("quiz", "title course")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: attempts.length,
      attempts,
    });
  } catch (error) {
    console.error("Get quiz attempts error:", error);
    return res.status(500).json({
      message: "Failed to fetch quiz attempts",
    });
  }
};

module.exports = {
  createQuiz,
  getQuiz,
  submitQuiz,
  getMyQuizAttempts,
};
