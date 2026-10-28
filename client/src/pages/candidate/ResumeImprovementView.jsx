import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Award,
  Layers,
  ArrowRight,
  BookOpen,
  FolderGit2
} from 'lucide-react';

export default function ResumeImprovementView() {
  const { jobId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await axiosClient.get(`/candidates/resume-suggestions/${jobId}`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to generate resume suggestions.');
      } finally {
        setLoading(false);
      }
    };

    if (jobId && jobId !== 'all') {
      fetchSuggestions();
    } else {
      // Default sample view if loaded without specific job
      setLoading(false);
    }
  }, [jobId]);

  if (loading) {
    return <LoadingSpinner message="Generating tailored resume improvement recommendations..." />;
  }

  // Data matching Screen 12
  const missingSkills = data?.suggestions?.missingKeywords?.slice(0, 3) || ['Docker', 'AWS', 'TypeScript'];
  const highlightSkills = data?.suggestions?.skillsToHighlight?.slice(0, 3) || ['React', 'Node.js', 'MongoDB'];
  const keywords = ['REST API', 'Full Stack', 'MERN', 'Agile', 'Git', 'CI/CD'];
  const projectSuggestions = [
    'Add more details on technologies and frameworks used in project descriptions.',
    'Include live deployment links and GitHub repository URLs.',
    'Highlight quantified impact (e.g. reduced load time by 30%, served 500+ users).'
  ];
  const certificationSuggestions = [
    'AWS Certified Developer - Associate',
    'MongoDB Certified Developer Associate'
  ];

  return (
    <div className="space-y-6">
      {/* Screen 12 Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Resume Improvement Suggestions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Based on your resume and the selected job: <span className="font-semibold text-blue-600">{data?.job?.title || 'Full Stack Developer'}</span>
        </p>
      </div>

      {/* Screen 12 Top Row: Missing Skills to Learn & Skills to Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Missing Skills to Learn */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Missing Skills to Learn</span>
          </div>
          <p className="text-[11px] text-slate-500">
            High priority skills required for this role not detected in your resume:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {missingSkills.map((s, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Skills to Highlight */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Skills to Highlight</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Existing resume strengths that match key job criteria:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {highlightSkills.map((s, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Screen 12 Middle: Resume Keywords */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Resume Keywords</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Recommended industry keywords to naturally incorporate in experience bullet points:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {keywords.map((kw, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Screen 12 Bottom Row: Project Suggestions & Certification Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Suggestions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <FolderGit2 className="w-4 h-4 text-indigo-600" />
            <span>Project Suggestions</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            {projectSuggestions.map((ps, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>{ps}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Certification Suggestions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Certification Suggestions</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            {certificationSuggestions.map((cs, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>{cs}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="flex justify-between items-center pt-2">
        <Link
          to="/candidate/applications"
          className="text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          ← Back to My Applications
        </Link>
        <Link
          to="/candidate/resume-upload"
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
        >
          Update Resume Now
        </Link>
      </div>
    </div>
  );
}
