import { Lesson } from '../models/Lesson.js';
import { User } from '../models/User.js';
import { loadCourseOrThrow, canViewCourse } from './courseAccess.js';

export async function loadLessonOrThrow(lessonId) {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    const e = new Error('Bài học không tồn tại');
    e.status = 404;
    throw e;
  }
  return lesson;
}

/** Học viên đã ghi danh, giáo viên chủ nhiệm, hoặc Admin */
export async function assertCanAccessLesson(user, lesson) {
  const course = await loadCourseOrThrow(lesson.course);
  if (user.role === User.ROLES.ADMIN) return { course, lesson };
  if (canViewCourse(user, course)) return { course, lesson };
  const e = new Error('Không có quyền truy cập bài học');
  e.status = 403;
  throw e;
}

export async function assertCanAccessLessonCmi(user, lesson) {
  return assertCanAccessLesson(user, lesson);
}
