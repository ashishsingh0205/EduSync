require("dotenv").config();

const mongoose = require("mongoose");
const Course = require("./models/Course");
const User = require("./models/User");

async function addDemoCourses() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/edusync"
    );

    console.log("MongoDB connected successfully");

    const instructor = await User.findOne({
      email: "instructor@edusync.com",
      role: "instructor",
    });

    if (!instructor) {
      throw new Error(
        "Instructor not found. Check the instructor email in MongoDB."
      );
    }

    const demoCourses = [
      {
        title: "React JS Complete Course",
        description:
          "Learn React components, props, state, hooks and build modern user interfaces.",
        category: "Web Development",
        price: 2499,
        level: "beginner",
      },
      {
        title: "Node.js Backend Development",
        description:
          "Learn REST APIs, Express, MongoDB integration and backend development.",
        category: "Backend Development",
        price: 2999,
        level: "intermediate",
      },
    ];

    for (const item of demoCourses) {
      const existingCourse = await Course.findOne({
        title: item.title,
        instructor: instructor._id,
      });

      if (existingCourse) {
        console.log(`Course already exists: ${item.title}`);

        // If it already exists, publish it without creating a duplicate.
        if (!existingCourse.isPublished) {
          existingCourse.isPublished = true;
          await existingCourse.save();
          console.log(`Published: ${item.title}`);
        }

        continue;
      }

      const newCourse = await Course.create({
        ...item,
        instructor: instructor._id,
        thumbnail: "",
        isPublished: true,
      });

      console.log(`Added: ${newCourse.title}`);
      console.log(`Course ID: ${newCourse._id}`);
    }

    console.log("Demo courses setup completed!");
  } catch (error) {
    console.error("Error adding demo courses:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

addDemoCourses();