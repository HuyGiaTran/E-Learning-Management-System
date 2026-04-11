import { Course } from '../models/Course.js';
import { User } from '../models/User.js';

export function isEnrolled(course, userId) {
  const id = String(userId);
  return (course.students || []).some((s) => String(s) === id);
}

export function isInstructor(course, userId) {
  return String(course.instructor) === String(userId);
}

/** Admin: toàn quyền; Giáo viên: khóa mình phụ trách; Học viên: đã ghi danh */
export function canViewCourse(user, course) {
  if (!user || !course) return false;
  if (user.role === User.ROLES.ADMIN) return true;
  if (user.role === User.ROLES.TEACHER && isInstructor(course, user._id)) return true;
  if (user.role === User.ROLES.STUDENT && isEnrolled(course, user._id)) return true;
  return false;
}

export async function loadCourseOrThrow(courseId) {
  const course = await Course.findById(courseId);
  if (!course) {
    const e = new Error('Khóa học không tồn tại');
    e.status = 404;
    throw e;
  }
  return course;
}

export function assertCourseView(user, course) {
  if (!canViewCourse(user, course)) {
    const e = new Error('Không có quyền xem khóa học này');
    e.status = 403;
    throw e;
  }
}

export function assertCourseManage(user, course) {
  if (user.role === User.ROLES.ADMIN) return;
  if (user.role === User.ROLES.TEACHER && isInstructor(course, user._id)) return;
  const e = new Error('Không có quyền quản lý khóa học');
  e.status = 403;
  throw e;
}
