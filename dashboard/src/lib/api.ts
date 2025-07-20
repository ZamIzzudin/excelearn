const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

  async register(email: string, password: string, name: string, role: string = 'user') {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
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

  async createEvent(formData: FormData) {
    const token = localStorage.getItem('token');
    return fetch(`${this.baseURL}/api/events`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then(res => res.json());
  }

  async updateEvent(id: string, formData: FormData) {
    const token = localStorage.getItem('token');
    return fetch(`${this.baseURL}/api/events/${id}`, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then(res => res.json());
  }

  async deleteEvent(id: string) {
    return this.request(`/api/events/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_URL);