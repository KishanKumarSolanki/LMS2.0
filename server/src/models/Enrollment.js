const { Schema, model, Types } = require('mongoose');

const enrollmentSchema = new Schema(
  {
    student: { type: Types.ObjectId, ref: 'User', required: true },
    course: { type: Types.ObjectId, ref: 'Course', required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons: { type: [String], default: [] },
    certificateCode: { type: String, unique: true, sparse: true },
    certificateIssuedAt: { type: Date },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = model('Enrollment', enrollmentSchema);
