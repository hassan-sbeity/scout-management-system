import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Users, Calendar, LogOut, UserPlus, Trash2, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChiefDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user', uniform_required: 'Standard Scout Uniform' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, eventsRes] = await Promise.all([
        axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/events`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(usersRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/users`, newUser, { headers: { Authorization: `Bearer ${token}` } });
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'user', uniform_required: 'Standard Scout Uniform' });
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to add user');
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;
    
    try {
      await axios.delete(`${API}/users/${email}`, { headers: { Authorization: `Bearer ${token}` } });
      loadData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to delete user');
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

  const admins = users.filter(u => u.role === 'admin');
  const regularUsers = users.filter(u => u.role === 'user');

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-800 to-violet-900 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-manrope font-bold text-xl text-slate-900">Chief Dashboard</h1>
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
                <p className="font-manrope font-medium text-xs uppercase tracking-wider text-slate-500">Scout Members</p>
                <p className="font-manrope font-bold text-3xl text-slate-900 mt-2">{regularUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-violet-700" />
              </div>
            </div>
          </div>

          <div data-testid="stats-admins-card" className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-manrope font-medium text-xs uppercase tracking-wider text-slate-500">Admins</p>
                <p className="font-manrope font-bold text-3xl text-slate-900 mt-2">{admins.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div data-testid="stats-events-card" className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-manrope font-medium text-xs uppercase tracking-wider text-slate-500">Total Events</p>
                <p className="font-manrope font-bold text-3xl text-slate-900 mt-2">{events.length}</p>
              </div>
              <div className="w-12 h-12 bg-violet-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-violet-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="font-manrope font-bold text-2xl text-slate-900">User Management</h2>
          <button
            data-testid="add-user-button"
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-2 h-10 px-5 bg-violet-800 hover:bg-violet-900 text-white rounded-lg font-manrope font-medium text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Add User / Admin
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-manrope font-bold text-lg text-slate-900 mb-4">Admins ({admins.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {admins.map((admin, index) => (
                <div key={index} data-testid={`admin-card-${index}`} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-manrope font-semibold text-slate-900">{admin.name}</h4>
                      <p className="text-sm text-slate-600 font-inter">{admin.email}</p>
                      <p className="text-xs text-slate-500 font-inter mt-1">Uniform: {admin.uniform_required}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                          {admin.events_joined_count} events
                        </span>
                        <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded-full text-xs font-medium">
                          Admin
                        </span>
                      </div>
                    </div>
                    <button
                      data-testid={`delete-admin-${index}`}
                      onClick={() => handleDeleteUser(admin.email)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {admins.length === 0 && (
                <p className="text-center text-slate-500 font-inter py-8">No admins yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-manrope font-bold text-lg text-slate-900 mb-4">Scout Members ({regularUsers.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {regularUsers.map((usr, index) => (
                <div key={index} data-testid={`user-card-${index}`} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-manrope font-semibold text-slate-900">{usr.name}</h4>
                      <p className="text-sm text-slate-600 font-inter">{usr.email}</p>
                      <p className="text-xs text-slate-500 font-inter mt-1">Uniform: {usr.uniform_required}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                          {usr.events_joined_count} events
                        </span>
                        <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded-full text-xs font-medium">
                          {usr.achievements?.length || 0} badges
                        </span>
                      </div>
                    </div>
                    <button
                      data-testid={`delete-user-${index}`}
                      onClick={() => handleDeleteUser(usr.email)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {regularUsers.length === 0 && (
                <p className="text-center text-slate-500 font-inter py-8">No scout members yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-manrope font-bold text-xl text-slate-900">Add New User</h3>
              <button
                data-testid="close-add-user-modal"
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block font-manrope font-medium text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Full Name
                </label>
                <input
                  data-testid="new-user-name"
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-md focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-inter"
                />
              </div>
              <div>
                <label className="block font-manrope font-medium text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Email
                </label>
                <input
                  data-testid="new-user-email"
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-md focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-inter"
                />
              </div>
              <div>
                <label className="block font-manrope font-medium text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Password
                </label>
                <input
                  data-testid="new-user-password"
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-md focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-inter"
                />
              </div>
              <div>
                <label className="block font-manrope font-medium text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Role
                </label>
                <select
                  data-testid="new-user-role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-md focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-inter"
                >
                  <option value="user">Scout Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block font-manrope font-medium text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Uniform Required
                </label>
                <input
                  data-testid="new-user-uniform"
                  type="text"
                  required
                  value={newUser.uniform_required}
                  onChange={(e) => setNewUser({ ...newUser, uniform_required: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-md focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-inter"
                />
              </div>
              <button
                data-testid="submit-new-user"
                type="submit"
                className="w-full h-11 bg-violet-800 hover:bg-violet-900 text-white font-manrope font-medium rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                Add User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChiefDashboard;
