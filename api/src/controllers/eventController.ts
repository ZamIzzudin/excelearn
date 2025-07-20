import { Request, Response } from 'express';
import { Event } from '../models/Event';
import { validationResult } from 'express-validator';
import cloudinary from '../config/cloudinary';

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
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
    const event = await Event.findById(id).populate('createdBy', 'name email');
    
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

    const { title, description, date, time, location, max_participants } = req.body;
    let posterUrl = null;

    // Handle file upload
    if (req.file) {
      posterUrl = req.file.path;
    }

    const event = new Event({
      title,
      description,
      date: new Date(date),
      time,
      location,
      maxParticipants: parseInt(max_participants),
      posterUrl,
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
    const { title, description, date, time, location, max_participants } = req.body;

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

    const event = await Event.findByIdAndUpdate(
      id,
      {
        title,
        description,
        date: new Date(date),
        time,
        location,
        maxParticipants: parseInt(max_participants),
        posterUrl,
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

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