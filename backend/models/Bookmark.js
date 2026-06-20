const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    userId: { type: String, required: true },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, internshipId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
