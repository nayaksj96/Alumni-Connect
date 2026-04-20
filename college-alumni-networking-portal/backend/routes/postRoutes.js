import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { postCreateSchema, postCommentSchema } from '../validators/schemas.js';
import { listFeed, createPost, toggleLike, addComment, deletePost } from '../controllers/postController.js';

const router = express.Router();

router.get('/', protect, listFeed);
router.post('/', protect, validate(postCreateSchema), createPost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, validate(postCommentSchema), addComment);
router.delete('/:id', protect, deletePost);

export default router;
