const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);