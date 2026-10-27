import express from 'express';
import {
  getStudentProfile,
  updateStudentProfile,
  getDashboardStats,
  getAllUsers
} from '../controllers/userController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.get('/stats', getDashboardStats);
router.get('/all', authorizeRoles('admin'), getAllUsers);

export default router;
