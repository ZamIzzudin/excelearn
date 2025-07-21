const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
import toast from 'react-hot-toast';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      // Don't show toast here as it's handled in components
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }

  // User methods
  async getUsers() {
    return this.request('/api/users');
  }

  async getUserById(id: string) {
    return this.request(`/api/users/${id}`);
  }

  async createUser(data: any) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async updateUser(id: string, data: any) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Event methods
  async getEvents() {
    return this.request('/api/events');
  }

  async getEventById(id: string) {
    return this.request(`/api/events/${id}`);
  }

  async getEventOptions() {
    return this.request('/api/events/options');
  }

  async createEvent(formData: FormData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/api/events`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create event');
    }
    return data;
  }

  async updateEvent(id: string, formData: FormData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/api/events/${id}`, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update event');
    }
    return data;
  }

  async deleteEvent(id: string) {
    return this.request(`/api/events/${id}`, {
      method: 'DELETE',
    });
  }

  async registerToEvent(id: string) {
    return this.request(`/api/events/${id}/register`, {
      method: 'POST',
    });
  }

  async getEventAttendees(id: string) {
    return this.request(`/api/events/${id}/attendees`);
  }

  async markAttendance(eventId: string, userId: string, attended: boolean) {
    return this.request(`/api/events/${eventId}/attendees/${userId}/attendance`, {
      method: 'PATCH',
      body: JSON.stringify({ attended }),
    });
  }
}

export const api = new ApiClient(API_URL);