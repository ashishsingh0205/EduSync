const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  enrollCourse,
  getMyEnrollments,
} = require("../controllers/enrollmentController");

const router = express.Router();

router.post(
  "/enroll",
  protect,
  allowRoles("student"),
  enrollCourse
);

router.get(
  "/my-courses",
  protect,
  allowRoles("student"),
  getMyEnrollments
);

module.exports = router;