import mongoose from "mongoose";

// creating job schema's of fields that are required to enter for the job details in the form
const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    company: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Company",
    },
    description : {
        type: String,
        required: true
    },
    salary: {
        type: String,
    },
    location: {
        type: String,
    },
    noOfOpenings: {
        type : Number,
        required: true
    },
    niches: [
        {
            type: String,
        }
    ],
    jobPostedOn: {
        type: Date,
        default: Date.now,
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isActive: {
        type : Boolean,
        default: true
    },
    applications : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application"
        }
    ]
});

export const Job = mongoose.model("Job", jobSchema);