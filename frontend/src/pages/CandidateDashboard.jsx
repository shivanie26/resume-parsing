import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  UserCheck, 
  FileText, 
  Award, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Briefcase, 
  Sparkles,
  BookOpen
} from 'lucide-react';

const CandidateDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const res = await api.get('/dashboard/candidate');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Candidate dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidateData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const { resume, assessments, recommendedSkillsToLearn } = data || {};
  const parsed = resume?.parsedData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" /> Candidate Career Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {parsed.name || 'Candidate'}</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">Manage your active resume, view extracted competencies, and track job match assessments.</p>
        </div>
        <Link
          to="/upload-resume"
          className="px-5 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-2 transition-all shrink-0"
        >
          <Upload className="w-4 h-4" /> Update Resume Document
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Active Resume</span>
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          {resume ? (
            <div>
              <div className="font-bold text-slate-900 text-base">{resume.fileName}</div>
              <div className="text-xs text-slate-500 mt-1">Uploaded on: {new Date(resume.uploadedAt).toLocaleDateString()}</div>
              <div className="mt-3 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
                ✓ Parsed Successfully
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-500">No active resume uploaded yet.</p>
              <Link to="/upload-resume" className="text-xs font-bold text-emerald-600 hover:underline mt-2 inline-block">
                Upload Now →
              </Link>
            </div>
          )}
        </div>

        <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Total Experience</span>
            <Briefcase className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{parsed.total_experience || 0} Years</div>
            <div className="text-xs text-slate-500 mt-1">Calculated from work history & projects</div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Recruiter Assessments</span>
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{assessments?.length || 0} Evaluated</div>
            <div className="text-xs text-slate-500 mt-1">Job applications scored by recruiters</div>
          </div>
        </div>

      </div>

      {/* Extracted Skills & Missing Skills Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Extracted Skills Box */}
        <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900">Detected Skills & Competencies</h3>
          </div>
          <p className="text-xs text-slate-500">Extracted automatically from your uploaded resume text</p>

          <div className="flex flex-wrap gap-2 pt-2">
            {parsed.skills && parsed.skills.length > 0 ? (
              parsed.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  ✓ {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500">Upload your resume to extract skills.</p>
            )}
          </div>
        </div>

        {/* Career Growth & Recommended Skills Box */}
        <div className="glass-card p-6 rounded-2xl border-amber-200 bg-amber-50/20 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-base text-slate-900">Recommended Skills to Master</h3>
          </div>
          <p className="text-xs text-slate-500">Top in-demand skills missing from your current profile to increase job match score</p>

          <div className="flex flex-wrap gap-2 pt-2">
            {recommendedSkillsToLearn && recommendedSkillsToLearn.length > 0 ? (
              recommendedSkillsToLearn.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">You already possess top skills for active job postings!</span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default CandidateDashboard;
