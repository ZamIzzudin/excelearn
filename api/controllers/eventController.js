const Event = require('../models/Event');
const User = require('../models/User');

// Get all events with filtering and pagination
const getAllEvents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      level, 
      status, 
      search,
      startDate,
      endDate 
    } = req.query;

    const filter = {};
    
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      filter.dateTime = {};
      if (startDate) filter.dateTime.$gte = new Date(startDate);
      if (endDate) filter.dateTime.$lte = new Date(endDate);
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'name email')
      .sort({ dateTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      data: events,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

// Get single event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('attendees.user', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user.id // Assuming user is authenticated
    };

    const event = new Event(eventData);
    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: populatedEvent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is authorized to update (creator or admin)
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is authorized to delete (creator or admin)
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
};

// Register user to event
const registerToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { email, name } = req.body;
    const userId = req.user.id;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is still open for registration
    if (event.status === 'closed' || event.status === 'completed' || event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Event is not open for registration'
      });
    }

    // Check if event is full
    if (event.attendees.length >= event.quota) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Check if user is already registered
    const isAlreadyRegistered = event.attendees.some(
      attendee => attendee.user.toString() === userId
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Add user to attendees
    event.attendees.push({
      user: userId,
      email: email || req.user.email,
      name: name || req.user.name,
      registeredAt: new Date()
    });

    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for the event',
      data: {
        eventId: event._id,
        eventName: event.name,
        registeredAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering for event',
      error: error.message
    });
  }
};

// Unregister user from event
const unregisterFromEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is registered
    const attendeeIndex = event.attendees.findIndex(
      attendee => attendee.user.toString() === userId
    );

    if (attendeeIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    // Remove user from attendees
    event.attendees.splice(attendeeIndex, 1);
    await event.save();

    res.json({
      success: true,
      message: 'Successfully unregistered from the event'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unregistering from event',
      error: error.message
    });
  }
};

// Mark attendee as attended (for admin/event creator)
const markAttendance = async (req, res) => {
  try {
    const { eventId, attendeeId } = req.params;
    const { attended } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is authorized (creator or admin)
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark attendance'
      });
    }

    // Find attendee
    const attendee = event.attendees.id(attendeeId);

    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: 'Attendee not found'
      });
    }

    // Update attendance
    attendee.attended = attended;
    if (attended) {
      attendee.attendedAt = new Date();
    } else {
      attendee.attendedAt = undefined;
    }

    await event.save();

    res.json({
      success: true,
      message: `Attendance ${attended ? 'marked' : 'unmarked'} successfully`,
      data: attendee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating attendance',
      error: error.message
    });
  }
};

// Get event attendees (for admin/event creator)
const getEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { attended } = req.query;

    const event = await Event.findById(eventId)
      .populate('attendees.user', 'name email profile');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is authorized (creator or admin)
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view attendees'
      });
    }

    let attendees = event.attendees;

    // Filter by attendance status if specified
    if (attended !== undefined) {
      const isAttended = attended === 'true';
      attendees = attendees.filter(attendee => attendee.attended === isAttended);
    }

    res.json({
      success: true,
      data: {
        event: {
          _id: event._id,
          name: event.name,
          dateTime: event.dateTime,
          quota: event.quota,
          totalRegistered: event.attendees.length,
          totalAttended: event.attendees.filter(a => a.attended).length
        },
        attendees
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendees',
      error: error.message
    });
  }
};

// Get unique categories for dropdown
const getCategories = async (req, res) => {
  try {
    const categories = await Event.distinct('category');
    res.json({
      success: true,
      data: categories.filter(cat => cat) // Remove null/empty values
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Get unique statuses for dropdown
const getStatuses = async (req, res) => {
  try {
    const statuses = await Event.distinct('status');
    res.json({
      success: true,
      data: statuses.filter(status => status) // Remove null/empty values
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statuses',
      error: error.message
    });
  }
};

// Get user's registered events
const getUserEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const filter = {
      'attendees.user': userId
    };

    if (status) {
      filter.status = status;
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'name email')
      .sort({ dateTime: 1 });

    // Add user's registration info to each event
    const eventsWithUserInfo = events.map(event => {
      const userAttendee = event.attendees.find(
        attendee => attendee.user.toString() === userId
      );
      
      return {
        ...event.toObject(),
        userRegistration: userAttendee
      };
    });

    res.json({
      success: true,
      data: eventsWithUserInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user events',
      error: error.message
    });
  }
};

module.exports = {
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
};