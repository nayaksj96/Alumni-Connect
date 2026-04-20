import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { messageCreateSchema } from '../validators/schemas.js';
import { listConversations, listMessagesWith, sendMessage } from '../controllers/messageController.js';

const router = express.Router();

router.use(protect);
router.get('/conversations', listConversations);
router.get('/with/:userId', listMessagesWith);
router.post('/', validate(messageCreateSchema), sendMessage);

export default router;
