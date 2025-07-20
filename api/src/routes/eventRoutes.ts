import { Router } from 'express';
import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController';
import { createEventValidator, updateEventValidator } from '../validators/eventValidator';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', authenticateToken, upload.single('poster'), createEventValidator, createEvent);
router.put('/:id', authenticateToken, upload.single('poster'), updateEventValidator, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);

export default router;