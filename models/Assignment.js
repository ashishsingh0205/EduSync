const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    totalMarks: {
      type: Number,
      default: 100,
    },

    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        answer: {
          type: String,
          default: "",
        },

        submittedAt: {
          type: Date,
          default: Date.now,
        },

        marks: {
          type: Number,
          default: null,
        },

        feedback: {
          type: String,
          default: "",
        },

        status: {
          type: String,
          enum: ["submitted", "graded"],
          default: "submitted",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Assignment", assignmentSchema);