import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendee {
  userId: mongoose.Types.ObjectId;
  email: string;
  name: string;
  registeredAt: Date;
  attended: boolean;
  attendedAt?: Date;
}

export interface IEvent extends Document {
  category: string;
  posterUrl?: string;
  name: string;
  description: string;
  language: string;
  duration: number; // in hours
  assessment: boolean;
  lecturers: number;
  quota: number;
  level: string;
  items: string[];
  location: string;
  date: Date;
  time: string;
  attendees: IAttendee[];
  status: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const attendeeSchema = new Schema<IAttendee>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  attended: {
    type: Boolean,
    default: false,
  },
  attendedAt: {
    type: Date,
  },
});

const eventSchema = new Schema<IEvent>({
  category: {
    type: String,
    required: true,
    trim: true,
  },
  posterUrl: {
    type: String,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  language: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 0.5,
  },
  assessment: {
    type: Boolean,
    default: false,
  },
  lecturers: {
    type: Number,
    required: true,
    min: 1,
  },
  quota: {
    type: Number,
    required: true,
    min: 1,
  },
  level: {
    type: String,
    required: true,
    trim: true,
  },
  items: [{
    type: String,
    trim: true,
  }],
  location: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  attendees: [attendeeSchema],
  status: {
    type: String,
    required: true,
    trim: true,
    default: 'Open',
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Add virtual for available slots
eventSchema.virtual('availableSlots').get(function() {
  return this.quota - this.attendees.length;
});

// Update status based on quota
eventSchema.pre('save', function(next) {
  if (this.attendees.length >= this.quota) {
    this.status = 'Full Quota';
  } else if (this.status === 'Full Quota' && this.attendees.length < this.quota) {
    this.status = 'Open';
  }
  next();
});

export const Event = mongoose.model<IEvent>('Event', eventSchema);