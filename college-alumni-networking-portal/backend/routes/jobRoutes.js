import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { jobCreateSchema } from '../validators/schemas.js';
import { listJobs, createJob, applyJob, deleteJob } from '../controllers/jobController.js';

const router = express.Router();

router.get('/', protect, listJobs);
router.post('/', protect, authorize('admin', 'alumni'), validate(jobCreateSchema), createJob);
router.post('/:id/apply', protect, applyJob);
router.delete('/:id', protect, deleteJob);

export default router;
