import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  sendRequest,
  acceptRequest,
  rejectRequest,
  listMine,
} from '../controllers/connectionController.js';

const router = express.Router();

router.use(protect);
router.get('/', listMine);
router.post('/:id/request', sendRequest);
router.patch('/:id/accept', acceptRequest);
router.patch('/:id/reject', rejectRequest);

export default router;
