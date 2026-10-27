import express from 'express';
import {
  getStudentCertificates,
  issueCertificate,
  verifyCertificate
} from '../controllers/certificateController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public verification route
router.get('/verify/:id', verifyCertificate);

// Protected routes
router.get('/', authenticate, getStudentCertificates);
router.post('/issue', authenticate, authorizeRoles('admin', 'company', 'mentor'), issueCertificate);

export default router;
