import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.middleware.js';
import { User } from '../models/User.js';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';

const router = Router();

router.use(authenticate(true), requireRoles(User.ROLES.ADMIN));

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
