import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tent, LogIn } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      if (user.role === 'chief') {
        navigate('/chief');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1645165052641-c4081bc9eb48?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Scout camping"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/80 to-violet-700/80 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <Tent className="w-20 h-20 mx-auto mb-6" />
            <h1 className="font-manrope font-extrabold text-5xl mb-4">ScoutFlow</h1>
            <p className="font-inter text-lg opacity-90">Manage your scout events, achievements, and community</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4 lg:hidden">
                <Tent className="w-12 h-12 text-violet-800" />
              </div>
              <h2 className="font-manrope font-bold text-3xl text-slate-900 mb-2">Welcome Back</h2>
              <p className="font-inter text-slate-600">Sign in to your account</p>
            </div>

            {error && (
              <div data-testid="login-error" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-inter">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-manrope font-medium text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Email Address
                </label>
                <input
                  data-testid="login-email-input"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-md focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-inter"
                  placeholder="scout@example.com"
                />
              </div>

              <div>
                <label className="block font-manrope font-medium text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Password
                </label>
                <input
                  data-testid="login-password-input"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-md focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-inter"
                  placeholder="••••••••"
                />
              </div>

              <button
                data-testid="login-submit-button"
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-violet-800 hover:bg-violet-900 text-white font-manrope font-medium rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 font-inter">
            <p>Demo Accounts:</p>
            <p>Chief: chief@scout.com / Admin: admin@scout.com / User: user@scout.com</p>
            <p>(password: demo123)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;