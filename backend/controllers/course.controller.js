import { Course } from '../models/Course.js';
import { Lesson } from '../models/Lesson.js';
import { User } from '../models/User.js';
import {
  assertCourseManage,
  assertCourseView,
  isEnrolled,
  isInstructor,
  loadCourseOrThrow,
} from '../utils/courseAccess.js';

function courseOut(c) {
  const o = c.toObject ? c.toObject() : c;
  return {
    ...o,
    id: String(o._id),
    instructor: o.instructor
      ? typeof o.instructor === 'object'
        ? { id: String(o.instructor._id), fullName: o.instructor.fullName, email: o.instructor.email }
        : String(o.instructor)
      : o.instructor,
    students: (o.students || []).map((s) => (typeof s === 'object' ? String(s._id) : String(s))),
    lessons: o.lessons,
  };
}

export async function listCourses(req, res, next) {
  try {
    const { discover } = req.query;

    if (
      discover === 'true' &&
      (req.user.role === User.ROLES.STUDENT || req.user.role === User.ROLES.ADMIN)
    ) {
      const list = await Course.find({ published: true })
        .populate('instructor', 'fullName email')
        .sort({ updatedAt: -1 })
        .lean();
      const out = list.map((c) => ({
        ...c,
        id: String(c._id),
        isEnrolled: isEnrolled(c, req.user._id),
      }));
      return res.json(out);
    }

    let query = {};
    if (req.user.role === User.ROLES.ADMIN) {
      query = {};
    } else if (req.user.role === User.ROLES.TEACHER) {
      query = { instructor: req.user._id };
    } else {
      query = { students: req.user._id };
    }

    const list = await Course.find(query)
      .populate('instructor', 'fullName email')
      .sort({ updatedAt: -1 })
      .lean();

    res.json(
      list.map((c) => ({
        ...c,
        id: String(c._id),
        isEnrolled: isEnrolled(c, req.user._id),
      }))
    );
  } catch (err) {
    next(err);
  }
}

export async function getCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'fullName email')
      .populate('lessons')
      .populate('students', 'fullName email');
    if (!course) {
      return res.status(404).json({ message: 'Khóa học không tồn tại' });
    }
    assertCourseView(req.user, course);
    const c = course.toObject();
    c.id = String(c._id);
    c.isEnrolled = isEnrolled(course, req.user._id);
    c.isInstructor = isInstructor(course, req.user._id);
    res.json(c);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

export async function createCourse(req, res, next) {
  try {
    const { name, description, instructorId, published } = req.body || {};
    if (!name) {
      return res.status(400).json({ message: 'Thiếu tên khóa học' });
    }

    let instructor = req.user._id;
    if (req.user.role === User.ROLES.ADMIN) {
      if (!instructorId) {
        return res.status(400).json({ message: 'Admin cần chỉ định instructorId (giáo viên phụ trách)' });
      }
      const u = await User.findById(instructorId);
      if (!u || u.role !== User.ROLES.TEACHER) {
        return res.status(400).json({ message: 'instructorId phải là Giáo viên hợp lệ' });
      }
      instructor = u._id;
    } else if (req.user.role === User.ROLES.TEACHER) {
      instructor = req.user._id;
    } else {
      return res.status(403).json({ message: 'Không có quyền tạo khóa học' });
    }

    const course = await Course.create({
      name: String(name).trim(),
      description: String(description || ''),
      instructor,
      published: published !== false,
      students: [],
      lessons: [],
    });
    const populated = await Course.findById(course._id).populate('instructor', 'fullName email');
    res.status(201).json(courseOut(populated));
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const course = await loadCourseOrThrow(req.params.id);
    assertCourseManage(req.user, course);
    const { name, description, instructorId, published } = req.body || {};
    if (name != null) course.name = String(name).trim();
    if (description != null) course.description = String(description);
    if (published != null && req.user.role === User.ROLES.ADMIN) {
      course.published = Boolean(published);
    }
    if (instructorId != null && req.user.role === User.ROLES.ADMIN) {
      const u = await User.findById(instructorId);
      if (!u || u.role !== User.ROLES.TEACHER) {
        return res.status(400).json({ message: 'instructorId không hợp lệ' });
      }
      course.instructor = u._id;
    }
    await course.save();
    const populated = await Course.findById(course._id).populate('instructor', 'fullName email');
    res.json(courseOut(populated));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

export async function deleteCourse(req, res, next) {
  try {
    const course = await loadCourseOrThrow(req.params.id);
    assertCourseManage(req.user, course);
    const lids = course.lessons || [];
    if (lids.length) await Lesson.deleteMany({ _id: { $in: lids } });
    await course.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

export async function enrollSelf(req, res, next) {
  try {
    if (req.user.role !== User.ROLES.STUDENT) {
      return res.status(403).json({ message: 'Chỉ học viên tự ghi danh' });
    }
    const course = await loadCourseOrThrow(req.params.id);
    if (!course.published) {
      return res.status(400).json({ message: 'Khóa học chưa mở' });
    }
    if (isEnrolled(course, req.user._id)) {
      return res.status(400).json({ message: 'Đã ghi danh trước đó' });
    }
    course.students.push(req.user._id);
    await course.save();
    res.json({ ok: true, course: courseOut(await Course.findById(course._id).populate('instructor', 'fullName email')) });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

export async function unenrollSelf(req, res, next) {
  try {
    const course = await loadCourseOrThrow(req.params.id);
    course.students = (course.students || []).filter((s) => String(s) !== String(req.user._id));
    await course.save();
    res.json({ ok: true });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

export async function listCourseStudents(req, res, next) {
  try {
    const course = await Course.findById(req.params.id).populate('students', 'fullName email role');
    if (!course) {
      return res.status(404).json({ message: 'Khóa học không tồn tại' });
    }
    assertCourseManage(req.user, course);
    res.json(course.students || []);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

export async function addStudentToCourse(req, res, next) {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: 'Thiếu email học viên' });
    }
    const course = await loadCourseOrThrow(req.params.id);
    assertCourseManage(req.user, course);
    const student = await User.findOne({
      email: String(email).toLowerCase().trim(),
      role: User.ROLES.STUDENT,
    });
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy học viên với email này' });
    }
    if (isEnrolled(course, student._id)) {
      return res.status(400).json({ message: 'Học viên đã trong khóa' });
    }
    course.students.push(student._id);
    await course.save();
    res.status(201).json({ ok: true, student: { id: String(student._id), fullName: student.fullName, email: student.email } });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

export async function removeStudentFromCourse(req, res, next) {
  try {
    const course = await loadCourseOrThrow(req.params.id);
    assertCourseManage(req.user, course);
    const sid = req.params.studentId;
    course.students = (course.students || []).filter((s) => String(s) !== String(sid));
    await course.save();
    res.json({ ok: true });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}
