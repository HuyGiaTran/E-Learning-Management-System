import mongoose from 'mongoose';

/** Tiến độ SCORM 1.2 (cmi.core.*) theo từng học viên và bài học */
const scormProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    /** cmi.core.lesson_status */
    lessonStatus: { type: String, default: '', trim: true, maxlength: 64 },
    /** cmi.core.score.raw — lưu dạng Number hoặc null nếu rỗng/không hợp lệ */
    scoreRaw: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

scormProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

export const ScormProgress = mongoose.model('ScormProgress', scormProgressSchema);
