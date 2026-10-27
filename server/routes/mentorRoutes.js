import express from 'express';
import {
  getAllMentors,
  getMentorAllocations,
  allocateMentor,
  autoAllocateMentor
} from '../controllers/mentorController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllMentors);
router.get('/allocations', getMentorAllocations);
router.post('/allocate', authorizeRoles('admin'), allocateMentor);
router.post('/auto-allocate', authorizeRoles('admin'), autoAllocateMentor);

export default router;
