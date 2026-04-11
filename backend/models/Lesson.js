import mongoose from 'mongoose';

const LESSON_TYPES = ['Video', 'Text', 'SCORM'];

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: LESSON_TYPES,
      required: true,
    },
    /** Nội dung văn bản (type Text) hoặc URL Cloudinary / URL tĩnh SCORM */
    content: { type: String, default: '' },
    /** Thư mục gói SCORM dưới uploads/scorm (vd: uuid) */
    scormPackageId: { type: String, default: '', trim: true },
    /** Đường dẫn file chạy chính so với gốc gói (vd: index.html, sco/start.html) */
    scormEntryHref: { type: String, default: '', trim: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
  },
  { timestamps: true }
);

lessonSchema.statics.TYPES = LESSON_TYPES;

export const Lesson = mongoose.model('Lesson', lessonSchema);
