import { Router } from 'express';
import { User } from '../models/User.js';
import { authenticate, requireRoles } from '../middleware/auth.middleware.js';
import { uploadScormZip } from '../middleware/upload.middleware.js';
import {
  uploadScormPackage,
  saveScormCmi,
  getScormCmi,
} from '../controllers/scorm.controller.js';

const router = Router();

const teacherOrAdmin = [
  authenticate(true),
  requireRoles(User.ROLES.ADMIN, User.ROLES.TEACHER),
];

router.post(
  '/packages',
  ...teacherOrAdmin,
  uploadScormZip.single('file'),
  uploadScormPackage
);

router.post('/cmi', authenticate(true), saveScormCmi);

router.get('/cmi/:lessonId', authenticate(true), getScormCmi);

export default router;
