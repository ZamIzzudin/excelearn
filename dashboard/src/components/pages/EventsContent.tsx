/** @format */

"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Plus, Edit, Trash2, Calendar, MapPin, Users, Eye, Clock, BookOpen, Award, Globe } from "lucide-react";
import toast from "react-hot-toast";

interface Event {
  _id: string;
  category: string;
  posterUrl?: string;
  name: string;
  description: string;
  language: string;
  duration: number;
  assessment: boolean;
  lecturers: number;
  quota: number;
  level: string;
  items: string[];
  location: string;
  date: string;
  time: string;
  attendees: any[];
  status: string;
  createdAt: string;
}

interface EventOptions {
  categories: string[];
  statuses: string[];
  levels: string[];
}

export const EventsContent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventOptions, setEventOptions] = useState<EventOptions>({
    categories: [],
    statuses: [],
    levels: []
  });
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    description: "",
    language: "",
    duration: "",
    assessment: false,
    lecturers: "",
    quota: "",
    level: "",
    items: [] as string[],
    location: "",
    date: "",
    time: "",
    status: "Open",
  });
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newLevel, setNewLevel] = useState("");

  useEffect(() => {
    fetchEvents();
    fetchEventOptions();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.getEvents();
      setEvents(response.events);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventOptions = async () => {
    try {
      const response = await api.getEventOptions();
      setEventOptions(response);
    } catch (error) {
      console.error("Error fetching event options:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingEvent ? 'Updating event...' : 'Creating event...');

    const formDataToSend = new FormData();
    formDataToSend.append("category", formData.category);
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("language", formData.language);
    formDataToSend.append("duration", formData.duration);
    formDataToSend.append("assessment", formData.assessment.toString());
    formDataToSend.append("lecturers", formData.lecturers);
    formDataToSend.append("quota", formData.quota);
    formDataToSend.append("level", formData.level);
    formDataToSend.append("items", JSON.stringify(formData.items));
    formDataToSend.append("location", formData.location);
    formDataToSend.append("date", formData.date);
    formDataToSend.append("time", formData.time);
    formDataToSend.append("status", formData.status);

    if (posterFile) {
      formDataToSend.append("poster", posterFile);
    }

    try {
      if (editingEvent) {
        await api.updateEvent(editingEvent._id, formDataToSend);
        toast.success('Event updated successfully!', { id: loadingToast });
      } else {
        await api.createEvent(formDataToSend);
        toast.success('Event created successfully!', { id: loadingToast });
      }

      fetchEvents();
      fetchEventOptions();
      resetForm();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error(editingEvent ? 'Failed to update event' : 'Failed to create event', { id: loadingToast });
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      category: event.category,
      name: event.name,
      description: event.description,
      language: event.language,
      duration: event.duration.toString(),
      assessment: event.assessment,
      lecturers: event.lecturers.toString(),
      quota: event.quota.toString(),
      level: event.level,
      items: event.items || [],
      location: event.location,
      date: new Date(event.date).toLocaleDateString("en-CA"),
      time: event.time,
      status: event.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (_id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      const loadingToast = toast.loading('Deleting event...');
      try {
        await api.deleteEvent(_id);
        fetchEvents();
        toast.success('Event deleted successfully!', { id: loadingToast });
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error('Failed to delete event', { id: loadingToast });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      category: "",
      name: "",
      description: "",
      language: "",
      duration: "",
      assessment: false,
      lecturers: "",
      quota: "",
      level: "",
      items: [],
      location: "",
      date: "",
      time: "",
      status: "Open",
    });
    setPosterFile(null);
    setEditingEvent(null);
    setShowForm(false);
    setNewItem("");
    setNewCategory("");
    setNewStatus("");
    setNewLevel("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addItem = () => {
    if (newItem.trim()) {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem.trim()]
      }));
      setNewItem("");
    }
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleCategoryChange = (value: string) => {
    if (value === "add_new") {
      if (newCategory.trim()) {
        setFormData(prev => ({ ...prev, category: newCategory.trim() }));
        setNewCategory("");
      }
    } else {
      setFormData(prev => ({ ...prev, category: value }));
    }
  };

  const handleStatusChange = (value: string) => {
    if (value === "add_new") {
      if (newStatus.trim()) {
        setFormData(prev => ({ ...prev, status: newStatus.trim() }));
        setNewStatus("");
      }
    } else {
      setFormData(prev => ({ ...prev, status: value }));
    }
  };

  const handleLevelChange = (value: string) => {
    if (value === "add_new") {
      if (newLevel.trim()) {
        setFormData(prev => ({ ...prev, level: newLevel.trim() }));
        setNewLevel("");
      }
    } else {
      setFormData(prev => ({ ...prev, level: value }));
    }
  };

  const viewEventDetail = (event: Event) => {
    setSelectedEvent(event);
    setShowDetail(true);
  };

  if (loading) {
    return <div className="text-center">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Events
        </h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingEvent ? "Edit Event" : "Create New Event"}
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {eventOptions.categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="add_new">+ Add New Category</option>
                  </select>
                  {formData.category === "" && (
                    <input
                      type="text"
                      placeholder="New category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onBlur={() => handleCategoryChange("add_new")}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  )}
                </div>
              </div>

              <Input
                label="Event Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Duration (hours)"
                  name="duration"
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Number of Lecturers"
                  name="lecturers"
                  type="number"
                  min="1"
                  value={formData.lecturers}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Quota"
                  name="quota"
                  type="number"
                  min="1"
                  value={formData.quota}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Level
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.level}
                    onChange={(e) => handleLevelChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Select Level</option>
                    {eventOptions.levels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                    <option value="add_new">+ Add New Level</option>
                  </select>
                  {formData.level === "" && (
                    <input
                      type="text"
                      placeholder="New level"
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value)}
                      onBlur={() => handleLevelChange("add_new")}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Items/Topics
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add item"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Button type="button" onClick={addItem} size="sm">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.items.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Select Status</option>
                    {eventOptions.statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                    <option value="add_new">+ Add New Status</option>
                  </select>
                  {formData.status === "" && (
                    <input
                      type="text"
                      placeholder="New status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      onBlur={() => handleStatusChange("add_new")}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="assessment"
                  checked={formData.assessment}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Has Assessment
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Poster
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  {editingEvent ? "Update Event" : "Create Event"}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Event Detail Modal */}
      {showDetail && selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={() => setShowDetail(false)} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event._id}>
            {event.posterUrl && (
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img
                  src={event.posterUrl}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  {event.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  event.status === 'Full Quota' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {event.status}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {event.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {event.description}
              </p>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {event.attendees.length}/{event.quota} participants
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {event.duration}h
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  {event.language}
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {event.level}
                </div>
                {event.assessment && (
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    Has Assessment
                  </div>
                )}
              </div>

              <div className="flex space-x-2 mt-4">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => viewEventDetail(event)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEdit(event)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(event._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No events found. Create your first event to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Event Detail Modal Component
const EventDetailModal = ({ event, onClose }: { event: Event; onClose: () => void }) => {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendees();
  }, []);

  const fetchAttendees = async () => {
    try {
      const response = await api.getEventAttendees(event._id);
      setAttendees(response.event.attendees);
    } catch (error) {
      console.error("Error fetching attendees:", error);
      toast.error("Failed to load attendees");
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (userId: string, attended: boolean) => {
    try {
      await api.markAttendance(event._id, userId, attended);
      fetchAttendees();
      toast.success(`Attendance ${attended ? 'marked' : 'unmarked'} successfully`);
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Failed to update attendance");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {event.name}
            </h2>
            <Button variant="secondary" onClick={onClose}>
              ×
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Event Details</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Category:</strong> {event.category}</p>
                <p><strong>Language:</strong> {event.language}</p>
                <p><strong>Duration:</strong> {event.duration} hours</p>
                <p><strong>Level:</strong> {event.level}</p>
                <p><strong>Lecturers:</strong> {event.lecturers}</p>
                <p><strong>Assessment:</strong> {event.assessment ? 'Yes' : 'No'}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Date & Time:</strong> {new Date(event.date).toLocaleDateString()} at {event.time}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Registration Info</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Status:</strong> {event.status}</p>
                <p><strong>Quota:</strong> {event.quota}</p>
                <p><strong>Registered:</strong> {attendees.length}</p>
                <p><strong>Available:</strong> {event.quota - attendees.length}</p>
                <p><strong>Attended:</strong> {attendees.filter(a => a.attended).length}</p>
              </div>
            </div>
          </div>

          {event.items && event.items.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Topics/Items</h3>
              <div className="flex flex-wrap gap-2">
                {event.items.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-4">Attendees ({attendees.length})</h3>
            {loading ? (
              <p>Loading attendees...</p>
            ) : attendees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Attendance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {attendees.map((attendee) => (
                      <tr key={attendee._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {attendee.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {attendee.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(attendee.registeredAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            size="sm"
                            variant={attendee.attended ? "secondary" : "primary"}
                            onClick={() => markAttendance(attendee.userId, !attendee.attended)}
                          >
                            {attendee.attended ? "Present" : "Mark Present"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No attendees registered yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};