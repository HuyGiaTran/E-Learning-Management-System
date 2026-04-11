import mongoose from 'mongoose';

const ROLE = {
  ADMIN: 'Admin',
  TEACHER: 'Giáo viên',
  STUDENT: 'Học viên',
};

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: [ROLE.ADMIN, ROLE.TEACHER, ROLE.STUDENT],
      default: ROLE.STUDENT,
    },
  },
  { timestamps: true }
);

userSchema.statics.ROLES = ROLE;

export const User = mongoose.model('User', userSchema);
