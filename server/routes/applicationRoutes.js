import express from 'express';
import {
  getApplications,
  applyInternship,
  updateApplicationStatus,
  withdrawApplication
} from '../controllers/applicationController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getApplications);
router.post('/apply', authorizeRoles('student'), applyInternship);
router.put('/:id/status', authorizeRoles('company', 'admin'), updateApplicationStatus);
router.delete('/:id', withdrawApplication);

export default router;
