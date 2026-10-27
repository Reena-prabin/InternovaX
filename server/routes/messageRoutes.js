import express from 'express';
import { getConversations, getMessagesWithUser, sendMessage } from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/conversations', getConversations);
router.get('/:userId', getMessagesWithUser);
router.post('/', sendMessage);

export default router;
