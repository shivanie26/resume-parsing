import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Award,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  Building,
  Sparkles,
  Zap,
  RefreshCw
} from 'lucide-react';

export default function Login() {
  const [role, setRole] = useState('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Automatically route according to role
      if (user.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials and network connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Auto-fill Helper
  const handleQuickFill = (type) => {
    if (type === 'candidate') {
      setRole('candidate');
      setEmail('sankar@gmail.com');
      setPassword('password123');
    } else {
      setRole('recruiter');
      setEmail('recruiter@hiresmart.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/60">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Left Column: Sign-in Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Header / Brand */}
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Hire<span className="text-blue-600">Smart</span>
                </span>
              </Link>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
                Secure Sign In
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Sign in to manage your resume evaluations or recruiter pipeline.
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl my-6">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  role === 'candidate'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  role === 'recruiter'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Recruiter</span>
              </button>
            </div>

            {/* Quick Demo Credentials Pill Banner */}
            <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-blue-900 font-semibold">
                <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Quick Demo:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('candidate')}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white text-blue-700 hover:bg-blue-100 rounded-lg shadow-2xs border border-blue-200 transition cursor-pointer"
                >
                  Candidate Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('recruiter')}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white text-indigo-700 hover:bg-indigo-100 rounded-lg shadow-2xs border border-indigo-200 transition cursor-pointer"
                >
                  Recruiter Demo
                </button>
              </div>
            </div>

            {isExpired && (
              <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Your session expired. Please sign in again.</span>
              </div>
            )}

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">Error: </span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Please contact administrator (eshivani26@gmail.com) to reset your password.');
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 border-slate-300 cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to {role === 'recruiter' ? 'Recruiter Portal' : 'Candidate Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center text-xs text-slate-500 pt-5 mt-5 border-t border-slate-100">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline">
              Create an account here
            </Link>
          </div>
        </div>

        {/* Right Column: Promotional Card Illustration */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-semibold border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Real-time Recruitment Analytics
            </span>
            <h3 className="text-2xl font-black leading-snug tracking-tight">
              Fair & Objective Hiring Starts Here
            </h3>
            <p className="text-xs text-blue-100 leading-relaxed">
              Verify competencies with benchmark MCQs, anonymous resume screening, and auditable candidate ranking.
            </p>
          </div>

          {/* Graphical Score Preview */}
          <div className="relative z-10 my-6 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Platform Benchmark</span>
              <span className="text-[10px] font-black bg-blue-400/20 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full">
                Active System
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-blue-100 mb-1">
                  <span>Skill Match Accuracy</span>
                  <span className="font-bold text-white">94%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-blue-100 mb-1">
                  <span>Adverse Impact Ratio</span>
                  <span className="font-bold text-white">0.94 (EEOC Pass)</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-blue-300 h-2 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[11px] text-blue-200 pt-4 border-t border-white/20">
            <span>HireSmart • Version 2.0</span>
            <span>Zero Hallucinations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
