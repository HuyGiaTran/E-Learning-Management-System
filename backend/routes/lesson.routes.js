import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getLesson, updateLesson, deleteLesson } from '../controllers/lesson.controller.js';

const router = Router();

router.use(authenticate(true));

router.get('/:lessonId', getLesson);
router.patch('/:lessonId', updateLesson);
router.delete('/:lessonId', deleteLesson);

export default router;
