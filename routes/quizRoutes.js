const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createQuiz,
  getQuiz,
  submitQuiz,
  getMyQuizAttempts,
} = require("../controllers/quizController");

const router = express.Router();


// Create Quiz
// 🟢 INSTRUCTOR TOKEN
router.post(
  "/create",
  protect,
  allowRoles("instructor"),
  createQuiz
);


// Submit Quiz
// 🔵 STUDENT TOKEN
router.post(
  "/submit",
  protect,
  allowRoles("student"),
  submitQuiz
);


// My Quiz Attempts
// 🔵 STUDENT TOKEN
router.get(
  "/my-attempts",
  protect,
  allowRoles("student"),
  getMyQuizAttempts
);


// Get Quiz
// 🔵 STUDENT TOKEN / 🟢 INSTRUCTOR TOKEN
router.get(
  "/:quizId",
  protect,
  getQuiz
);


module.exports = router;