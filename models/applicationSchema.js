import mongoose from "mongoose";
const applicationSchema = new mongoose.Schema({
    coverLetter: {
      type: String,
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    appliedOn: {
      type: Date,
      default: Date.now,
    },
});

export const Application = mongoose.model("Application", applicationSchema);
