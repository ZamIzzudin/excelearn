const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  poster: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Poster must be a valid URL'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0.5,
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'Duration must be greater than 0'
    }
  },
  assessment: {
    type: Boolean,
    default: false
  },
  lecturers: {
    type: Number,
    required: true,
    min: 1
  },
  quota: {
    type: Number,
    required: true,
    min: 1
  },
  level: {
    type: String,
    required: true,
    enum: ['entry level', 'intermediate', 'advanced', 'all'],
    lowercase: true
  },
  items: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: true,
    trim: true
  },
  dateTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    attended: {
      type: Boolean,
      default: false
    },
    attendedAt: {
      type: Date
    }
  }],
  status: {
    type: String,
    enum: ['open', 'full', 'closed', 'completed', 'cancelled'],
    default: 'open'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for available slots
eventSchema.virtual('availableSlots').get(function() {
  return this.quota - this.attendees.length;
});

// Virtual for attendance count
eventSchema.virtual('attendanceCount').get(function() {
  return this.attendees.filter(attendee => attendee.attended).length;
});

// Middleware to update status based on quota
eventSchema.pre('save', function(next) {
  if (this.attendees.length >= this.quota) {
    this.status = 'full';
  } else if (this.status === 'full' && this.attendees.length < this.quota) {
    this.status = 'open';
  }
  next();
});

// Index for better query performance
eventSchema.index({ dateTime: 1, status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ level: 1 });

module.exports = mongoose.model('Event', eventSchema);