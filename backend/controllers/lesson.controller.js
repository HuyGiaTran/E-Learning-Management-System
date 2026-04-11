import { Course } from '../models/Course.js';
import { Lesson } from '../models/Lesson.js';
import { assertCourseManage, assertCourseView, loadCourseOrThrow } from '../utils/courseAccess.js';

export async function listLessons(req, res, next) {
  try {
    const course = await Course.findById(req.params.id).populate('lessons');
    if (!course) {
      return res.status(404).json({ message: 'Khóa học không tồn tại' });
    }
    assertCourseView(req.user, course);
    res.json(course.lessons || []);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

export async function createLesson(req, res, next) {
  try {
    const course = await loadCourseOrThrow(req.params.id);
    assertCourseManage(req.user, course);
    const { title, type, content } = req.body || {};
    if (!title || !type) {
      return res.status(400).json({ message: 'Thiếu tiêu đề hoặc loại bài' });
    }
    if (!Lesson.TYPES.includes(type)) {
      return res.status(400).json({ message: 'Loại bài không hợp lệ (Video/Text/SCORM)' });
    }
    if (type === 'SCORM') {
      return res.status(400).json({
        message: 'Bài SCORM vui lòng tải qua POST /api/scorm/packages',
      });
    }
    const lesson = await Lesson.create({
      title: String(title).trim(),
      type,
      content: String(content || ''),
      course: course._id,
    });
    course.lessons.push(lesson._id);
    await course.save();
    res.status(201).json(lesson);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

export async function getLesson(req, res, next) {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Bài học không tồn tại' });
    }
    const course = await loadCourseOrThrow(lesson.course);
    assertCourseView(req.user, course);
    res.json(lesson);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

export async function updateLesson(req, res, next) {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Bài học không tồn tại' });
    }
    const course = await loadCourseOrThrow(lesson.course);
    assertCourseManage(req.user, course);
    const { title, content, type } = req.body || {};
    if (title != null) lesson.title = String(title).trim();
    if (content != null) lesson.content = String(content);
    if (type != null) {
      if (!Lesson.TYPES.includes(type)) {
        return res.status(400).json({ message: 'Loại bài không hợp lệ' });
      }
      lesson.type = type;
    }
    await lesson.save();
    res.json(lesson);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

export async function deleteLesson(req, res, next) {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Bài học không tồn tại' });
    }
    const course = await loadCourseOrThrow(lesson.course);
    assertCourseManage(req.user, course);
    course.lessons = (course.lessons || []).filter((id) => String(id) !== String(lesson._id));
    await course.save();
    await lesson.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}
