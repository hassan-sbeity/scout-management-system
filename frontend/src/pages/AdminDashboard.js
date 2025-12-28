import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Calendar, Award, LogOut, UserPlus, Plus, X, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_users: 0, total_events: 0, total_admins: 0 });
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newEvent, setNewEvent] = useState({ event_name: '', date: '', description: '' });
  const [newAchievement, setNewAchievement] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, eventsRes] = await Promise.all([
        axios.get(`${API}/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/events`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/events`, newEvent, { headers: { Authorization: `Bearer ${token}` } });
      setShowEventModal(false);
      setNewEvent({ event_name: '', date: '', description: '' });
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to create event');
    }
  };

  const handleAssignUser = async (userEmail) => {
    try {
      await axios.post(
        `${API}/events/${selectedEvent.event_name}/assign-user`,
        null,
        { 
          params: { user_email: userEmail },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setShowAssignModal(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to assign user');
    }
  };

  const handleAddAchievement = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API}/users/${selectedUser.email}/achievements`,
        { achievement: newAchievement },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAchievementModal(false);
      setNewAchievement('');
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to add achievement');
    }
  };

  const handleJoinEvent = async (eventName) => {
    try {
      await axios.post(
        `${API}/events/${eventName}/join`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to join event');
    }
  };

  const handleDeleteEvent = async (eventName) => {
    if (!window.confirm(`Are you sure you want to delete "${eventName}"?`)) return;
    
    try {
      await axios.delete(`${API}/events/${eventName}`, { headers: { Authorization: `Bearer ${token}` } });
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-800 border-r-transparent"></div>
          <p className="mt-4 text-slate-600 font-inter">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-800 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-manrope font-bold text-xl text-slate-900">Admin Dashboard</h1>
              <p className="text-xs text-slate-500 font-inter">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              data-testid="nav-events-button"
              onClick={() => navigate('/events')}
              className="px-4 py-2 text-slate-600 hover:text-violet-700 font-manrope font-medium text-sm transition-colors"
            >
              Events
            </button>
            <button
              data-testid="nav-profile-button"
              onClick={() => navigate('/profile')}
              className="px-4 py-2 text-slate-600 hover:text-violet-700 font-manrope font-medium text-sm transition-colors"
            >
              Profile
            </button>
            <button
              data-testid="logout-button"
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-manrope font-medium text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div data-testid="stats-users-card" className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-manrope font-medium text-xs uppercase tracking-wider text-slate-500">Total Users</p>
                <p className="font-manrope font-bold text-3xl text-slate-900 mt-2">{stats.total_users}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-violet-700" />
              </div>
            </div>
          </div>

          <div data-testid="stats-events-card" className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-manrope font-medium text-xs uppercase tracking-wider text-slate-500">Total Events</p>
                <p className="font-manrope font-bold text-3xl text-slate-900 mt-2">{stats.total_events}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div data-testid="stats-admins-card" className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-manrope font-medium text-xs uppercase tracking-wider text-slate-500">Total Admins</p>
                <p className="font-manrope font-bold text-3xl text-slate-900 mt-2">{stats.total_admins}</p>
              </div>
              <div className="w-12 h-12 bg-violet-50 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-violet-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-manrope font-bold text-xl text-slate-900">Events</h2>
              <button
                data-testid="create-event-button"
                onClick={() => setShowEventModal(true)}
                className="flex items-center gap-2 h-9 px-4 bg-violet-800 hover:bg-violet-900 text-white rounded-lg font-manrope font-medium text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <div key={index} data-testid={`event-card-${index}`} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-manrope font-semibold text-slate-900">{event.event_name}</h3>
                  <p className="text-sm text-slate-600 font-inter mt-1">{event.date}</p>
                  <p className="text-sm text-slate-600 font-inter mt-2">{event.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                      {event.users_assigned?.length || 0} users
                    </span>
                    <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded-full text-xs font-medium">
                      {event.admins_joined?.length || 0} admins
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      data-testid={`assign-user-button-${index}`}
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowAssignModal(true);
                      }}
                      className="flex-1 h-8 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md font-manrope font-medium text-xs transition-all"
                    >
                      Assign User
                    </button>
                    <button
                      data-testid={`join-event-button-${index}`}
                      onClick={() => handleJoinEvent(event.event_name)}
                      className="flex-1 h-8 px-3 bg-violet-800 hover:bg-violet-900 text-white rounded-md font-manrope font-medium text-xs transition-all"
                    >
                      Join Event
                    </button>
                    <button
                      data-testid={`delete-event-button-${index}`}
                      onClick={() => handleDeleteEvent(event.event_name)}
                      className="h-8 w-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-md font-manrope font-medium text-xs transition-all flex items-center justify-center"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-center text-slate-500 font-inter py-8">No events yet. Create your first event!</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-manrope font-bold text-xl text-slate-900 mb-6">Scout Members</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.filter(u => u.role === 'user').map((usr, index) => (
                <div key={index} data-testid={`user-card-${index}`} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-manrope font-semibold text-slate-900">{usr.name}</h3>
                      <p className="text-sm text-slate-600 font-inter">{usr.email}</p>
                      <p className="text-xs text-slate-500 font-inter mt-1">Uniform: {usr.uniform_required}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                          {usr.events_joined_count} events
                        </span>
                        <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded-full text-xs font-medium">
                          {usr.achievements?.length || 0} achievements
                        </span>
                      </div>
                    </div>
                    <button
                      data-testid={`add-achievement-button-${index}`}
                      onClick={() => {
                        setSelectedUser(usr);
                        setShowAchievementModal(true);
                      }}
                      className="h-8 px-3 bg-violet-800 hover:bg-violet-900 text-white rounded-md font-manrope font-medium text-xs transition-all flex items-center gap-1"
                    >
                      <Award className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                </div>
              ))}
              {users.filter(u => u.role === 'user').length === 0 && (
                <p className="text-center text-slate-500 font-inter py-8">No scout members yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-manrope font-bold text-xl text-slate-900">Create New Event</h3>
              <button
                data-testid="close-event-modal-button"
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block font-manrope font-medium text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Event Name
                </label>
                <input
                  data-testid="event-name-input"
                  type="text"
                  required
                  value={newEvent.event_name}
                  onChange={(e) => setNewEvent({ ...newEvent, event_name: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-md focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-inter"
                  placeholder="Summer Camp 2025"
                />
              </div>
              <div>
                <label className="block font-manrope font-medium text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Date
                </label>
                <input
                  data-testid="event-date-input"
                  type="date"
                  required
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-md focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-inter"
                />
              </div>
              <div>
                <label className="block font-manrope font-medium text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Description
                </label>
                <textarea
                  data-testid="event-description-input"
                  required
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-md focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-inter"
                  rows="3"
                  placeholder="Describe the event..."
                />
              </div>
              <button
                data-testid="submit-event-button"
                type="submit"
                className="w-full h-11 bg-violet-800 hover:bg-violet-900 text-white font-manrope font-medium rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                Create Event
              </button>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-manrope font-bold text-xl text-slate-900">Assign User to {selectedEvent?.event_name}</h3>
              <button
                data-testid="close-assign-modal-button"
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.filter(u => u.role === 'user').map((usr, index) => (
                <button
                  key={index}
                  data-testid={`assign-user-option-${index}`}
                  onClick={() => handleAssignUser(usr.email)}
                  className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <p className="font-manrope font-medium text-slate-900">{usr.name}</p>
                  <p className="text-sm text-slate-600 font-inter">{usr.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAchievementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-manrope font-bold text-xl text-slate-900">Add Achievement</h3>
              <button
                data-testid="close-achievement-modal-button"
                onClick={() => setShowAchievementModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAchievement} className="space-y-4">
              <div>
                <label className="block font-manrope font-medium text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Achievement for {selectedUser?.name}
                </label>
                <input
                  data-testid="achievement-input"
                  type="text"
                  required
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-md focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-inter"
                  placeholder="First Aid Badge"
                />
              </div>
              <button
                data-testid="submit-achievement-button"
                type="submit"
                className="w-full h-11 bg-violet-800 hover:bg-violet-900 text-white font-manrope font-medium rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                Add Achievement
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;