const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");
const Section = require("../models/Section");

// Create Lesson
const createLesson = async (req, res) => {
  try {
    const { title, description, videoUrl, section, order } = req.body;

    const lesson = await Lesson.create({
      title,
      description,
      videoUrl,
      section,
      order,
    });

    res.status(201).json({
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lesson creation failed",
      error: error.message,
    });
  }
};

// Get Lessons of a Section
const getSectionLessons = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const lessons = await Lesson.find({
      section: sectionId,
    }).sort({ order: 1 });

    res.json({
      message: "Lessons fetched successfully",
      lessons,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch lessons",
      error: error.message,
    });
  }
};

// Complete Lesson + Update Progress
const completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.body;

    // 1. Check lesson exists
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    // 2. Find section
    const section = await Section.findById(lesson.section);

    if (!section) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    // 3. Find student's enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: section.course,
    });

    if (!enrollment) {
      return res.status(404).json({
        message: "You are not enrolled in this course",
      });
    }

    // 4. Check if lesson is already completed
    if (enrollment.completedLessons.includes(lessonId)) {
      return res.status(400).json({
        message: "Lesson already completed",
      });
    }

    // 5. Add lesson to completed lessons
    enrollment.completedLessons.push(lessonId);

    // 6. Find all sections of this course
    const sections = await Section.find({
      course: section.course,
    });

    // 7. Get section IDs
    const sectionIds = sections.map((section) => section._id);

    // 8. Count total lessons in this course
    const totalLessons = await Lesson.countDocuments({
      section: { $in: sectionIds },
    });

    // 9. Count completed lessons
    const completedLessons = enrollment.completedLessons.length;

    // 10. Calculate progress
    if (totalLessons > 0) {
      enrollment.progress = Math.round(
        (completedLessons / totalLessons) * 100
      );
    }

    // 11. Check if course is completed
    if (enrollment.progress >= 100) {
      enrollment.progress = 100;
      enrollment.completed = true;
    }

    // 12. Save enrollment
    await enrollment.save();

    res.json({
      message: "Lesson completed successfully",
      enrollment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to complete lesson",
      error: error.message,
    });
  }
};

module.exports = {
  createLesson,
  getSectionLessons,
  completeLesson,
};