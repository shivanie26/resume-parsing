import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  UserCheck, 
  BookOpen, 
  Briefcase, 
  Award, 
  Code, 
  Zap, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const CandidateProfilePage = () => {
  const { candidateId } = useParams();
  const [candidateResume, setCandidateResume] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCandidate, resJobs] = await Promise.all([
          api.get(`/resumes/candidates?candidateId=${candidateId}`),
          api.get('/jobs')
        ]);

        if (resCandidate.data.candidates && resCandidate.data.candidates.length > 0) {
          const match = resCandidate.data.candidates.find(c => c.candidateId === candidateId || c._id === candidateId) || resCandidate.data.candidates[0];
          setCandidateResume(match);
        }
        if (resJobs.data.jobs) {
          setJobs(resJobs.data.jobs);
          if (resJobs.data.jobs.length > 0) setSelectedJobId(resJobs.data.jobs[0]._id);
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const parsed = candidateResume?.parsedData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Profile Card */}
      <div className="glass-card p-8 rounded-2xl border-slate-200 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
            {parsed.name ? parsed.name.charAt(0) : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{parsed.name || 'Candidate Profile'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Verified Candidate
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Email: {parsed.email || 'N/A'} | Phone: {parsed.phone || 'N/A'} | Experience: {parsed.total_experience || 0} Years
            </p>
          </div>
        </div>

        {/* Action: Select Job to Run Competency Assessment */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 w-full md:w-auto">
          <label className="block text-[11px] font-bold uppercase text-slate-600">Run Competency Assessment Against Job</label>
          <div className="flex gap-2">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 max-w-xs"
            >
              {jobs.map(j => (
                <option key={j._id} value={j._id}>{j.title}</option>
              ))}
            </select>
            {selectedJobId && (
              <Link
                to={`/assessment/${selectedJobId}/${candidateId}`}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm whitespace-nowrap flex items-center gap-1"
              >
                Assess Competency <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* Grid: Education, Skills, Work History, Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Skills & Education */}
        <div className="space-y-6">
          
          {/* Categorized Skills Card */}
          <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Extracted Skills
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1.5">Programming Languages</span>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.programming_languages && parsed.programming_languages.length > 0 ? (
                    parsed.programming_languages.map((pl, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
                        {pl}
                      </span>
                    ))
                  ) : <span className="text-xs text-slate-400">N/A</span>}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1.5">Tools & Frameworks</span>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.skills && parsed.skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Education Card */}
          <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" /> Educational Qualifications
            </h3>

            <div className="space-y-3">
              {parsed.education && parsed.education.map((edu, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900 text-sm">{edu.degree}</div>
                  <div className="text-slate-600 font-medium">{edu.institution}</div>
                  <div className="text-slate-400 mt-1">Graduation Year: {edu.year}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Work History & Projects */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Experience Timeline */}
          <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-600" /> Applicable Work Experience
            </h3>

            <div className="space-y-4">
              {parsed.experience && parsed.experience.map((exp, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-brand-500 space-y-1">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-brand-600"></div>
                  <div className="font-extrabold text-slate-900 text-sm">{exp.role}</div>
                  <div className="text-xs font-semibold text-slate-600">{exp.company} • <span className="text-brand-600">{exp.duration}</span></div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Portfolio */}
          <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-600" /> Key Technical Projects
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parsed.projects && parsed.projects.map((proj, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 text-sm">{proj.title}</div>
                  <p className="text-slate-600">{proj.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.technologies && proj.technologies.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" /> Verified Certifications
            </h3>

            <div className="flex flex-wrap gap-2">
              {parsed.certifications && parsed.certifications.map((c, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  📜 {c}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CandidateProfilePage;
