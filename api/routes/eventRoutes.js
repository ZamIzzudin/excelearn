const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerToEvent,
  unregisterFromEvent,
  markAttendance,
  getEventAttendees,
  getCategories,
  getStatuses,
  getUserEvents
} = require('../controllers/eventController');

// Middleware untuk autentikasi (perlu dibuat)
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.get('/', getAllEvents);
router.get('/categories', getCategories);
router.get('/statuses', getStatuses);
router.get('/:id', getEventById);

// Protected routes (require authentication)
router.use(auth); // Apply auth middleware to all routes below

// User routes
router.get('/user/my-events', getUserEvents);
router.post('/:eventId/register', registerToEvent);
router.delete('/:eventId/unregister', unregisterFromEvent);

// Admin/Creator routes
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.get('/:eventId/attendees', getEventAttendees);
router.patch('/:eventId/attendees/:attendeeId/attendance', markAttendance);

module.exports = router;