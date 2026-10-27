import express from 'express';
import { getEvaluations, submitEvaluation } from '../controllers/evaluationController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getEvaluations);
router.post('/', authorizeRoles('mentor', 'company', 'admin'), submitEvaluation);

export default router;
