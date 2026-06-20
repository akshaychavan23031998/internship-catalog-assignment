const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    userId: { type: String, required: true }, // simple stand-in for a real user
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
