import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { directoryQuerySchema, updateProfileSchema } from '../validators/schemas.js';
import {
  getMe,
  updateMe,
  getDirectory,
  getUserById,
  getSuggested,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/me', protect, getMe);
router.patch('/me', protect, validate(updateProfileSchema), updateMe);
router.get('/directory', protect, validate(directoryQuerySchema, 'query'), getDirectory);
router.get('/suggested', protect, getSuggested);
router.get('/:id', protect, getUserById);

export default router;
