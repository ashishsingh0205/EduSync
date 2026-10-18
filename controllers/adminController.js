
const User = require("../models/User");
const Course = require("../models/Course");

// ==========================================
// ADMIN DASHBOARD STATISTICS
// ==========================================
const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalAdmins,
      totalCourses,
      publishedCourses,
      unpublishedCourses,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "instructor" }),
      User.countDocuments({ role: "admin" }),
      Course.countDocuments(),
      Course.countDocuments({ isPublished: true }),
      Course.countDocuments({ isPublished: false }),
    ]);

    res.json({
      message: "Admin dashboard fetched successfully",
      statistics: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        totalCourses,
        publishedCourses,
        unpublishedCourses,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch admin dashboard",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL USERS
// ==========================================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      message: "Users fetched successfully",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL COURSES
// ==========================================
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    res.json({
      message: "Courses fetched successfully",
      totalCourses: courses.length,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};



/* ==========================================
   UPDATE USER ROLE - ADMIN
========================================== */

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const allowedRoles = ["student", "instructor", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    if (userId === req.user.id) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user role",
      error: error.message,
    });
  }
};

/* ==========================================
   DELETE USER - ADMIN
========================================== */

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (userId === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Do not allow deleting another admin through this endpoint.
    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admin accounts cannot be deleted through this endpoint",
      });
    }

    await User.deleteOne({ _id: userId });

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};



module.exports = {
  getAdminDashboard,
  getAllUsers,
  getAllCourses,
  updateUserRole,
  deleteUser,
};
