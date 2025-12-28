import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Award, Calendar, Shirt, ArrowLeft, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            data-testid="back-button"
            onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="font-manrope font-bold text-xl text-slate-900">My Profile</h1>
            <p className="text-xs text-slate-500 font-inter">View your scout information</p>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-800 to-violet-900 p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-12 h-12" />
              </div>
              <div>
                <h2 className="font-manrope font-extrabold text-3xl mb-2">{user?.name}</h2>
                <div className="flex items-center gap-2">
                  {user?.role === 'admin' ? (
                    <span data-testid="user-role-badge" className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-manrope font-semibold flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Scout Leader
                    </span>
                  ) : (
                    <span data-testid="user-role-badge" className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-manrope font-semibold">
                      Scout Member
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div data-testid="profile-email" className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-violet-700" />
              </div>
              <div className="flex-1">
                <p className="font-manrope font-medium text-xs uppercase tracking-wider text-slate-500 mb-1">Email Address</p>
                <p className="font-inter text-slate-900">{user?.email}</p>
              </div>
            </div>

            <div data-testid="profile-uniform" className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shirt className="w-6 h-6 text-violet-700" />
              </div>
              <div className="flex-1">
                <p className="font-manrope font-medium text-xs uppercase tracking-wider text-slate-500 mb-1">Uniform Required</p>
                <p className="font-inter text-slate-900">{user?.uniform_required || 'Standard Scout Uniform'}</p>
              </div>
            </div>

            <div data-testid="profile-events-count" className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-manrope font-medium text-xs uppercase tracking-wider text-slate-500 mb-1">Events Joined</p>
                <p className="font-manrope font-bold text-2xl text-slate-900">{user?.events_joined_count || 0}</p>
              </div>
            </div>

            <div data-testid="profile-achievements" className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-manrope font-medium text-xs uppercase tracking-wider text-slate-500 mb-3">Achievements</p>
                <div className="space-y-2">
                  {user?.achievements?.map((achievement, index) => (
                    <div key={index} data-testid={`profile-achievement-${index}`} className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-inter text-sm text-emerald-900">{achievement}</span>
                    </div>
                  ))}
                  {(!user?.achievements || user.achievements.length === 0) && (
                    <p className="text-slate-500 font-inter text-sm">No achievements yet. Keep working hard!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-manrope font-bold text-lg text-slate-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="font-manrope font-medium text-xs uppercase tracking-wider text-purple-700 mb-2">Role</p>
              <p className="font-manrope font-bold text-xl text-purple-900 capitalize">{user?.role}</p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="font-manrope font-medium text-xs uppercase tracking-wider text-emerald-700 mb-2">Events</p>
              <p className="font-manrope font-bold text-xl text-emerald-900">{user?.events_joined_count || 0}</p>
            </div>
            <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
              <p className="font-manrope font-medium text-xs uppercase tracking-wider text-violet-700 mb-2">Badges</p>
              <p className="font-manrope font-bold text-xl text-violet-900">{user?.achievements?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;