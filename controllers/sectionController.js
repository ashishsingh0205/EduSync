const Section = require("../models/Section");

// Create Section
const createSection = async (req, res) => {
  try {
    const { title, course, order } = req.body;

    const section = await Section.create({
      title,
      course,
      order,
    });

    res.status(201).json({
      message: "Section created successfully",
      section,
    });
  } catch (error) {
    res.status(500).json({
      message: "Section creation failed",
      error: error.message,
    });
  }
};


// Get Sections of a Course
const getCourseSections = async (req, res) => {
  try {
    const { courseId } = req.params;

    const sections = await Section.find({
      course: courseId,
    }).sort({ order: 1 });

    res.json({
      message: "Sections fetched successfully",
      sections,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sections",
      error: error.message,
    });
  }
};


module.exports = {
  createSection,
  getCourseSections,
};