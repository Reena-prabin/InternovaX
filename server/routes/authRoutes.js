import express from 'express';

import {
  register,
  login,
  getMe,
  switchRole,
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback
} from '../controllers/authController.js';

import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

// GitHub OAuth routes
router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);

// Existing authentication routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/switch-role', switchRole);

export default router;
