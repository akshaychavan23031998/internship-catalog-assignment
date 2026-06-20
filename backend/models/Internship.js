const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    domain: { type: String, required: true },        // e.g. "Software", "Marketing"
    location: { type: String, required: true },      // e.g. "Bangalore", "Remote"
    workMode: { type: String, required: true },      // "Remote" | "Hybrid" | "Onsite"
    durationMonths: { type: Number, required: true },
    stipendPerMonth: { type: Number, required: true }, // INR
    skills: { type: [String], default: [] },
    description: { type: String, required: true },
    postedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Internship', internshipSchema);
