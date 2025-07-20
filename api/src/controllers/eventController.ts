import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { validationResult } from 'express-validator';
import cloudinary from '../config/cloudinary';

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch events' });
    }

    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !event) {
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
    let poster_url = null;

    // Handle file upload
    if (req.file) {
      poster_url = req.file.path;
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert([
        {
          title,
          description,
          date,
          time,
          location,
          max_participants: parseInt(max_participants),
          poster_url,
          created_by: req.user.userId,
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create event' });
    }

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
    const { data: existingEvent } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    let poster_url = existingEvent.poster_url;

    // Handle new file upload
    if (req.file) {
      // Delete old image from cloudinary if exists
      if (existingEvent.poster_url) {
        const publicId = existingEvent.poster_url.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`event-posters/${publicId}`);
        }
      }
      poster_url = req.file.path;
    }

    const { data: event, error } = await supabase
      .from('events')
      .update({
        title,
        description,
        date,
        time,
        location,
        max_participants: parseInt(max_participants),
        poster_url,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update event' });
    }

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
    const { data: event } = await supabase
      .from('events')
      .select('poster_url')
      .eq('id', id)
      .single();

    if (event?.poster_url) {
      const publicId = event.poster_url.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`event-posters/${publicId}`);
      }
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete event' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};