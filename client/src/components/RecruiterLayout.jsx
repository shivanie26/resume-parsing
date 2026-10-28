import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Award,
  BarChart3,
  FileSpreadsheet,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  PlusCircle,
  ChevronRight
} from 'lucide-react';

export default function RecruiterLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { label: 'Jobs', path: '/recruiter/jobs/manage', icon: Briefcase },
    { label: 'Candidates', path: '/recruiter/candidates', icon: Users },
    { label: 'Assessments', path: '/recruiter/assessments', icon: Award },
    { label: 'Analytics', path: '/recruiter/analytics', icon: BarChart3 },
    { label: 'Reports', path: '/recruiter/reports', icon: FileSpreadsheet },
    { label: 'Profile', path: '/recruiter/profile', icon: User }
  ];

  const isItemActive = (itemPath) => {
    const current = location.pathname;
    if (itemPath === '/recruiter/dashboard') {
      return current === '/recruiter/dashboard';
    }
    if (itemPath === '/recruiter/jobs/manage') {
      return (
        current === '/recruiter/jobs/manage' ||
        current.startsWith('/recruiter/jobs/create') ||
        current.startsWith('/recruiter/jobs/edit')
      );
    }
    if (itemPath === '/recruiter/candidates') {
      return (
        current === '/recruiter/candidates' ||
        current.includes('/applicants') ||
        current.includes('/rankings') ||
        current.includes('/compare')
      );
    }
    if (itemPath === '/recruiter/reports') {
      return (
        current === '/recruiter/reports' ||
        current.startsWith('/recruiter/reports/') ||
        current.endsWith('/report')
      );
    }
    return current.startsWith(itemPath);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 text-lg">Hire<span className="text-blue-600">Smart</span></span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto md:min-h-screen flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-2.5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Hire<span className="text-blue-600">Smart</span>
            </span>
          </Link>
        </div>

        {/* Action Button: Post Job */}
        <div className="p-3">
          <Link
            to="/recruiter/jobs/create"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Job</span>
          </Link>
        </div>

        {/* Recruiter Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.path);
            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer with Dashboard & Logout shortcuts */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <Link
              to="/recruiter/profile"
              className="flex items-center gap-2.5 overflow-hidden hover:opacity-80 transition"
              title="View Recruiter Profile"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Recruiter'}</div>
                <div className="text-[10px] text-slate-500 truncate">{user?.company || 'Employer Portal'}</div>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              <Link
                to="/recruiter/dashboard"
                title="Go to Dashboard"
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <LayoutDashboard className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 hidden md:flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Recruiter Portal</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-800 capitalize">
              {location.pathname.split('/').pop().replace(/-/g, ' ') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/recruiter/jd-analyzer"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/80 transition"
            >
              JD Parser Tool
            </Link>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800">{user?.name}</div>
                <div className="text-xs text-indigo-600 font-medium">{user?.company || 'Recruiter'}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
