import { Router } from 'express';
import { 
  getAllEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  registerToEvent,
  markAttendance,
  getEventAttendees,
  getEventOptions
} from '../controllers/eventController';
import { createEventValidator, updateEventValidator } from '../validators/eventValidator';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public routes
router.get('/', getAllEvents);
router.get('/options', getEventOptions);
router.get('/:id', getEventById);

// Protected routes
router.post('/', authenticateToken, upload.single('poster'), createEventValidator, createEvent);
router.put('/:id', authenticateToken, upload.single('poster'), updateEventValidator, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);

// Registration and attendance routes
router.post('/:id/register', authenticateToken, registerToEvent);
router.get('/:id/attendees', authenticateToken, getEventAttendees);
router.patch('/:eventId/attendees/:userId/attendance', authenticateToken, markAttendance);

export default router;