import express from 'express';
import {
  getAllInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship
} from '../controllers/internshipController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public/authenticated read
router.get('/', (req, res, next) => {
  // Optional auth to attach user skill matching
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
}, getAllInternships);

router.get('/:id', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
}, getInternshipById);

// Company & Admin write
router.post('/', authenticate, authorizeRoles('company', 'admin'), createInternship);
router.put('/:id', authenticate, authorizeRoles('company', 'admin'), updateInternship);
router.delete('/:id', authenticate, authorizeRoles('company', 'admin'), deleteInternship);

export default router;
