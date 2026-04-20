import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { adminCreateUserSchema, adminUpdateUserSchema } from '../validators/schemas.js';
import {
  listUsers,
  updateUser,
  deleteUser,
  getAnalytics,
  moderateDeletePost,
  moderateDeleteJob,
  moderateDeleteEvent,
  createUser,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, admin);

router.get('/analytics', getAnalytics);
router.route('/users').get(listUsers).post(validate(adminCreateUserSchema), createUser);
router.route('/users/:id').patch(validate(adminUpdateUserSchema), updateUser).delete(deleteUser);
router.delete('/moderation/posts/:id', moderateDeletePost);
router.delete('/moderation/jobs/:id', moderateDeleteJob);
router.delete('/moderation/events/:id', moderateDeleteEvent);

export default router;
