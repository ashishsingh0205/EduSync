
const Course = require("../models/Course");

// ==========================================
// CREATE COURSE - INSTRUCTOR
// ==========================================
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      thumbnail,
      level,
    } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      price,
      thumbnail,
      level,
      instructor: req.user.id,
    });

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Course creation failed",
      error: error.message,
    });
  }
};

// ==========================================
// GET MY COURSES - INSTRUCTOR
// ==========================================
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      instructor: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      message: "Courses fetched successfully",
      courses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE COURSE - INSTRUCTOR
// ==========================================
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({
      _id: id,
      instructor: req.user.id,
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const {
      title,
      description,
      category,
      price,
      thumbnail,
      level,
    } = req.body;

    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (category !== undefined) course.category = category;
    if (price !== undefined) course.price = price;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (level !== undefined) course.level = level;

    await course.save();

    res.json({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Course update failed",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE COURSE - INSTRUCTOR
// ==========================================
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({
      _id: id,
      instructor: req.user.id,
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    await Course.deleteOne({ _id: id });

    res.json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Course deletion failed",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL PUBLISHED COURSES - PUBLIC
// ==========================================
const getPublishedCourses = async (req, res) => {
  try {
    const { search, category, level } = req.query;

    const filter = {
      isPublished: true,
    };

    if (search && search.trim()) {
      filter.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (category && category.trim()) {
      filter.category = {
        $regex: `^${category.trim()}$`,
        $options: "i",
      };
    }

    if (level && level.trim()) {
      const normalizedLevel = level.trim().toLowerCase();

      if (
        !["beginner", "intermediate", "advanced"].includes(
          normalizedLevel
        )
      ) {
        return res.status(400).json({
          message: "Invalid level filter",
        });
      }

      filter.level = normalizedLevel;
    }

    const courses = await Course.find(filter)
      .populate("instructor", "name profileImage")
      .sort({ createdAt: -1 });

    res.json({
      message: "Published courses fetched successfully",
      totalCourses: courses.length,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch published courses",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE PUBLISHED COURSE - PUBLIC
// ==========================================
const getPublishedCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const course = await Course.findOne({
      _id: courseId,
      isPublished: true,
    }).populate("instructor", "name profileImage");

    if (!course) {
      return res.status(404).json({
        message: "Published course not found",
      });
    }

    res.json({
      message: "Course details fetched successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch course details",
      error: error.message,
    });
  }
};

// ==========================================
// PUBLISH / UNPUBLISH COURSE - INSTRUCTOR
// ==========================================
const toggleCoursePublish = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const course = await Course.findOne({
      _id: id,
      instructor: req.user.id,
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found or access denied",
      });
    }

    course.isPublished = !course.isPublished;

    await course.save();

    res.json({
      message: course.isPublished
        ? "Course published successfully"
        : "Course unpublished successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update course publishing status",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORT ALL FUNCTIONS
// ==========================================
module.exports = {
  createCourse,
  getMyCourses,
  updateCourse,
  deleteCourse,
  getPublishedCourses,
  getPublishedCourseById,
  toggleCoursePublish,
};
