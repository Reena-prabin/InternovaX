import express from 'express';
import { getReports, submitReport, reviewReport } from '../controllers/reportController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getReports);
router.post('/submit', authorizeRoles('student'), submitReport);
router.put('/:id/review', authorizeRoles('mentor', 'company', 'admin'), reviewReport);

export default router;
