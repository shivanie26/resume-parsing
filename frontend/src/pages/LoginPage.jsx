import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.user.role === 'recruiter') {
        navigate('/recruiter-dashboard');
      } else {
        navigate('/candidate-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'recruiter') {
      setEmail('recruiter@platform.com');
      setPassword('password123');
    } else {
      setEmail('alex.rivera@email.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-card p-8 rounded-2xl border-slate-200 shadow-xl">
        
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to your account</h2>
          <p className="mt-1 text-sm text-slate-500">Access the Smart Resume & Competency Assessment Platform</p>
        </div>

        {/* Quick Fill Demo Credentials */}
        <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-center">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Quick Demo Accounts</span>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => fillDemo('recruiter')}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-brand-700 hover:bg-brand-50 flex items-center gap-1"
            >
              <Briefcase className="w-3.5 h-3.5" /> Recruiter Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemo('candidate')}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" /> Candidate Demo
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : <><LogIn className="w-4 h-4" /> Sign In</>}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
