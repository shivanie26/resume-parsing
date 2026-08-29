import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  FileText, 
  CheckCircle2, 
  Code, 
  Briefcase, 
  BookOpen, 
  Award, 
  UserCheck, 
  ShieldCheck,
  Zap
} from 'lucide-react';

const ResumeParsingResultPage = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await api.get(`/resumes/${id}`);
        if (res.data.success) {
          setResume(res.data.resume);
        }
      } catch (err) {
        setError('Failed to load parsed resume details.');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl">
          {error || 'Resume record not found.'}
        </div>
      </div>
    );
  }

  const parsed = resume.parsedData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" /> Parsed Structured JSON Record
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{parsed.name || 'Candidate Applicant'}</h1>
          <p className="text-slate-500 text-xs mt-1">Email: {parsed.email || 'N/A'} | Phone: {parsed.phone || 'N/A'} | Total Exp: {parsed.total_experience || 0} years</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/candidate-profile/${resume.candidateId}`}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            Full Profile View
          </Link>
          <Link
            to="/candidates"
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
          >
            Back to Pool
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'overview' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Structured Overview
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1 ${
            activeTab === 'json' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code className="w-4 h-4" /> Raw Extracted JSON
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1 ${
            activeTab === 'text' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Raw Resume Text
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Skills Breakdown */}
          <div className="glass-card p-6 rounded-2xl border-slate-200 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Extracted Technical Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {parsed.skills && parsed.skills.map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-800 text-xs font-bold border border-brand-200">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div className="glass-card p-6 rounded-2xl border-slate-200 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-600" /> Work History ({parsed.total_experience || 0} Yrs)
            </h3>
            <div className="space-y-3">
              {parsed.experience && parsed.experience.map((exp, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900">{exp.role} - {exp.company}</div>
                  <div className="text-slate-500 font-medium">{exp.duration}</div>
                  <p className="mt-1 text-slate-600">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="glass-card p-6 rounded-2xl border-slate-200 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" /> Educational Background
            </h3>
            <div className="space-y-3">
              {parsed.education && parsed.education.map((edu, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900">{edu.degree}</div>
                  <div className="text-slate-500 font-medium">{edu.institution} ({edu.year})</div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects & Certifications */}
          <div className="glass-card p-6 rounded-2xl border-slate-200 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" /> Projects & Certifications
            </h3>
            <div className="space-y-2">
              {parsed.projects && parsed.projects.map((p, i) => (
                <div key={i} className="p-2.5 bg-slate-50 rounded-lg text-xs font-semibold text-slate-800">
                  📁 {p.title}: {p.description}
                </div>
              ))}
              {parsed.certifications && parsed.certifications.map((c, i) => (
                <div key={i} className="p-2.5 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-semibold">
                  📜 {c}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'json' && (
        <div className="bg-slate-900 text-emerald-400 p-6 rounded-2xl overflow-x-auto text-xs font-mono border border-slate-800 shadow-inner">
          <pre>{JSON.stringify(parsed, null, 2)}</pre>
        </div>
      )}

      {activeTab === 'text' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 whitespace-pre-wrap font-mono text-xs text-slate-700 leading-relaxed">
          {resume.extractedText}
        </div>
      )}

    </div>
  );
};

export default ResumeParsingResultPage;
