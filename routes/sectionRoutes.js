const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createSection,
  getCourseSections,
} = require("../controllers/sectionController");

const router = express.Router();


// ===============================
// CREATE SECTION
// ===============================
router.post(
  "/create",
  protect,
  allowRoles("instructor"),
  createSection
);


// ===============================
// GET COURSE SECTIONS
// ===============================
router.get(
  "/course/:courseId",
  protect,
  getCourseSections
);


module.exports = router;