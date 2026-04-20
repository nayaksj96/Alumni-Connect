import express from 'express';
import { addAlumni, getAllAlumni } from '../controllers/alumniController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { adminCreateUserSchema } from '../validators/schemas.js';

const router = express.Router();

router.route('/').get(protect, getAllAlumni).post(protect, admin, validate(adminCreateUserSchema), addAlumni);

export default router;
