import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { eventCreateSchema } from '../validators/schemas.js';
import { listEvents, createEvent, rsvpEvent, deleteEvent } from '../controllers/eventController.js';

const router = express.Router();

router.get('/', protect, listEvents);
router.post('/', protect, authorize('admin', 'alumni'), validate(eventCreateSchema), createEvent);
router.post('/:id/rsvp', protect, rsvpEvent);
router.delete('/:id', protect, deleteEvent);

export default router;
