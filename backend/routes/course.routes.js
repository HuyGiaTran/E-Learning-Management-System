import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollSelf,
  unenrollSelf,
  listCourseStudents,
  addStudentToCourse,
  removeStudentFromCourse,
} from '../controllers/course.controller.js';
import { listLessons, createLesson } from '../controllers/lesson.controller.js';

const router = Router();

router.use(authenticate(true));

router.get('/', listCourses);
router.post('/', createCourse);

router.get('/:id/lessons', listLessons);
router.post('/:id/lessons', createLesson);

router.get('/:id/students', listCourseStudents);
router.post('/:id/students', addStudentToCourse);
router.delete('/:id/students/:studentId', removeStudentFromCourse);

router.post('/:id/enroll', enrollSelf);
router.post('/:id/unenroll', unenrollSelf);

router.get('/:id', getCourse);
router.patch('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;
