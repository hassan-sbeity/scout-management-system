import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Users, ArrowLeft, MapPin } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Events = () => {
  const { user, token } = useAuth();
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            data-testid="back-button"
            onClick={() => navigate(
              user?.role === 'chief' ? '/chief' : 
              user?.role === 'admin' ? '/admin' : 
              '/dashboard'
            )}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="font-manrope font-bold text-xl text-slate-900">All Events</h1>
            <p className="text-xs text-slate-500 font-inter">Browse scout activities</p>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => {
            const isAssigned = event.users_assigned?.includes(user?.email);
            const imageIndex = index % 3;
            const eventImages = [
              'https://images.unsplash.com/photo-1669635455986-95af2fb7e755?crop=entropy&cs=srgb&fm=jpg&q=85',
              'https://images.unsplash.com/photo-1632089401802-57a6747b3dd1?crop=entropy&cs=srgb&fm=jpg&q=85',
              'https://images.unsplash.com/photo-1572223729752-da11b61089af?crop=entropy&cs=srgb&fm=jpg&q=85'
            ];

            return (
              <div key={index} data-testid={`event-card-${index}`} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={eventImages[imageIndex]}
                    alt={event.event_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  {isAssigned && (
                    <div className="absolute top-3 right-3">
                      <span data-testid={`event-assigned-badge-${index}`} className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-manrope font-semibold shadow-lg">
                        Joined
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-manrope font-bold text-xl text-white">{event.event_name}</h3>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-inter mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                  </div>

                  <p className="text-sm text-slate-600 font-inter mb-4 line-clamp-2">{event.description}</p>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-manrope font-medium text-slate-700">
                        {event.users_assigned?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-8 h-8 bg-violet-50 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-violet-600" />
                      </div>
                      <span className="text-sm font-manrope font-medium text-slate-700">
                        {event.admins_joined?.length || 0} leaders
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-manrope font-bold text-xl text-slate-900 mb-2">No Events Yet</h3>
            <p className="text-slate-600 font-inter">Check back later for upcoming scout activities</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;