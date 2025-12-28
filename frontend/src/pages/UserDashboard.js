import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Award, Calendar, LogOut, TrendingUp, Shirt } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UserDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`, { headers: { Authorization: `Bearer ${token}` } });
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const myEvents = events.filter(e => e.users_assigned?.includes(user?.email));

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
              <h1 className="font-manrope font-bold text-xl text-slate-900">My Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div data-testid="stats-events-card" className="md:col-span-4 bg-gradient-to-br from-violet-800 to-violet-900 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="font-manrope font-medium text-xs uppercase tracking-wider opacity-90">Events Joined</p>
                <p className="font-manrope font-extrabold text-4xl mt-1">{user?.events_joined_count || 0}</p>
              </div>
            </div>
            <p className="text-sm opacity-80 font-inter">Keep participating in scout activities!</p>
          </div>

          <div data-testid="stats-achievements-card" className="md:col-span-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="font-manrope font-medium text-xs uppercase tracking-wider opacity-90">Achievements</p>
                <p className="font-manrope font-extrabold text-4xl mt-1">{user?.achievements?.length || 0}</p>
              </div>
            </div>
            <p className="text-sm opacity-80 font-inter">Badges earned through hard work</p>
          </div>

          <div data-testid="uniform-card" className="md:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Shirt className="w-6 h-6 text-violet-700" />
              </div>
              <div>
                <p className="font-manrope font-medium text-xs uppercase tracking-wider text-slate-500">Uniform Required</p>
              </div>
            </div>
            <p className="font-manrope font-semibold text-lg text-slate-900">{user?.uniform_required || 'Standard Scout Uniform'}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-manrope font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-700" />
              My Events
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {myEvents.map((event, index) => (
                <div key={index} data-testid={`my-event-card-${index}`} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-manrope font-semibold text-slate-900">{event.event_name}</h3>
                  <p className="text-sm text-slate-600 font-inter mt-1">{event.date}</p>
                  <p className="text-sm text-slate-600 font-inter mt-2">{event.description}</p>
                  <div className="mt-3">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                      Participating
                    </span>
                  </div>
                </div>
              ))}
              {myEvents.length === 0 && (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-inter">No events assigned yet</p>
                  <p className="text-sm text-slate-400 font-inter mt-1">Ask your admin to add you to events</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-manrope font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              My Achievements
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {user?.achievements?.map((achievement, index) => (
                <div key={index} data-testid={`achievement-item-${index}`} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-manrope font-medium text-slate-900">{achievement}</p>
                </div>
              ))}
              {(!user?.achievements || user.achievements.length === 0) && (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-inter">No achievements yet</p>
                  <p className="text-sm text-slate-400 font-inter mt-1">Keep working hard to earn badges!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;