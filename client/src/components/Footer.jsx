import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const location = useLocation();

  // Hide footer when in sidebar-based portals
  if (location.pathname.startsWith('/candidate') || location.pathname.startsWith('/recruiter')) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                Hire<span className="text-blue-600">Smart</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              Empowering fair, explainable recruitment through automated resume parsing,
              competency-based MCQ assessments, and anonymous candidate initial screening.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg w-fit">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Bias-Aware Architecture: Masking protected demographic attributes during initial screening.</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Candidate Tools</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="/jobs" className="hover:text-blue-600 transition-colors">Browse Job Openings</a></li>
              <li><a href="/candidate/resume-upload" className="hover:text-blue-600 transition-colors">AI Resume Parser</a></li>
              <li><a href="/candidate/applications" className="hover:text-blue-600 transition-colors">Application Tracking</a></li>
              <li><a href="/candidate/dashboard" className="hover:text-blue-600 transition-colors">Skill-Gap Analysis</a></li>
            </ul>
          </div>

          <div id="contact">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Recruiter Suite</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="/recruiter/dashboard" className="hover:text-blue-600 transition-colors">Analytics Dashboard</a></li>
              <li><a href="/recruiter/jobs/create" className="hover:text-blue-600 transition-colors">Post New Position</a></li>
              <li><a href="/recruiter/jd-analyzer" className="hover:text-blue-600 transition-colors">Job Description Parser</a></li>
              <li><a href="/recruiter/dashboard" className="hover:text-blue-600 transition-colors">CSV Evaluation Reports</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} HireSmart Platform. AI-Assisted, Bias-Aware Recruitment.
          </p>
          <p className="flex items-center gap-1">
            Built with React, Vite, Node.js, Express & MongoDB Atlas
          </p>
        </div>
      </div>
    </footer>
  );
}
