import { Request, Response } from 'express';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { validationResult } from 'express-validator';
import cloudinary from '../config/cloudinary';

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .populate('attendees.userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id)
      .populate('createdBy', 'name email')
      .populate('attendees.userId', 'name email');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createEvent = async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      category, name, description, language, duration, assessment, 
      lecturers, quota, level, items, location, date, time, status 
    } = req.body;
    
    let posterUrl = null;

    // Handle file upload
    if (req.file) {
      posterUrl = req.file.path;
    }

    // Parse items if it's a string
    let parsedItems = [];
    if (items) {
      parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    }

    const event = new Event({
      category,
      posterUrl,
      name,
      description,
      language,
      duration: parseFloat(duration),
      assessment: assessment === 'true' || assessment === true,
      lecturers: parseInt(lecturers),
      quota: parseInt(quota),
      level,
      items: parsedItems,
      location,
      date: new Date(date),
      time,
      status: status || 'Open',
      attendees: [],
      createdBy: req.user.userId,
    });

    await event.save();
    await event.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEvent = async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { 
      category, name, description, language, duration, assessment, 
      lecturers, quota, level, items, location, date, time, status 
    } = req.body;

    // Check if event exists
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    let posterUrl = existingEvent.posterUrl;

    // Handle new file upload
    if (req.file) {
      // Delete old image from cloudinary if exists
      if (existingEvent.posterUrl) {
        const publicId = existingEvent.posterUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`event-posters/${publicId}`);
        }
      }
      posterUrl = req.file.path;
    }

    // Parse items if it's a string
    let parsedItems = existingEvent.items;
    if (items) {
      parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    }

    const event = await Event.findByIdAndUpdate(
      id,
      {
        category,
        posterUrl,
        name,
        description,
        language,
        duration: parseFloat(duration),
        assessment: assessment === 'true' || assessment === true,
        lecturers: parseInt(lecturers),
        quota: parseInt(quota),
        level,
        items: parsedItems,
        location,
        date: new Date(date),
        time,
        status,
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('attendees.userId', 'name email');

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get event to delete poster from cloudinary
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.posterUrl) {
      const publicId = event.posterUrl.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`event-posters/${publicId}`);
      }
    }

    await Event.findByIdAndDelete(id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const registerToEvent = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user already registered
    const alreadyRegistered = event.attendees.some(
      attendee => attendee.userId.toString() === userId
    );

    if (alreadyRegistered) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Check if event is full
    if (event.attendees.length >= event.quota) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add user to attendees
    event.attendees.push({
      userId: userId,
      email: user.email,
      name: user.name,
      registeredAt: new Date(),
      attended: false,
    } as any);

    await event.save();

    res.json({
      message: 'Successfully registered for event',
      event: {
        id: event._id,
        name: event.name,
        availableSlots: event.quota - event.attendees.length
      }
    });
  } catch (error) {
    console.error('Register to event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { eventId, userId } = req.params;
    const { attended } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const attendeeIndex = event.attendees.findIndex(
      attendee => attendee.userId.toString() === userId
    );

    if (attendeeIndex === -1) {
      return res.status(404).json({ error: 'Attendee not found' });
    }

    event.attendees[attendeeIndex].attended = attended;
    if (attended) {
      event.attendees[attendeeIndex].attendedAt = new Date();
    } else {
      event.attendees[attendeeIndex].attendedAt = undefined;
    }

    await event.save();

    res.json({
      message: `Attendance ${attended ? 'marked' : 'unmarked'} successfully`,
      attendee: event.attendees[attendeeIndex]
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEventAttendees = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('attendees.userId', 'name email')
      .select('name attendees quota');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      event: {
        id: event._id,
        name: event.name,
        quota: event.quota,
        registeredCount: event.attendees.length,
        attendedCount: event.attendees.filter(a => a.attended).length,
        attendees: event.attendees
      }
    });
  } catch (error) {
    console.error('Get event attendees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get unique categories and statuses for dropdowns
export const getEventOptions = async (req: Request, res: Response) => {
  try {
    const categories = await Event.distinct('category');
    const statuses = await Event.distinct('status');
    const levels = await Event.distinct('level');

    res.json({
      categories: categories.filter(Boolean),
      statuses: statuses.filter(Boolean),
      levels: levels.filter(Boolean)
    });
  } catch (error) {
    console.error('Get event options error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};