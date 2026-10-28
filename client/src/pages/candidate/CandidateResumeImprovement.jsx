import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  FolderGit2,
  Upload,
  FileText
} from 'lucide-react';

export default function CandidateResumeImprovement() {
  const [profile, setProfile] = useState(null);
  const [latestResume, setLatestResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosClient.get('/candidates/me');
        if (res.data.success) {
          setProfile(res.data.profile);
          setLatestResume(res.data.latestResume);
        }
      } catch (err) {
        console.error('Failed to load profile for resume suggestions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Generating tailored resume improvement recommendations..." />;
  }

  const hasResume = Boolean(latestResume && latestResume._id);
  const candidateSkills = profile?.skills || latestResume?.parsedData?.skills || [];

  // Tailored recommendations
  const recommendedSkillsToLearn = ['Docker', 'AWS Cloud Practitioner', 'TypeScript', 'Jest / Unit Testing', 'CI/CD Pipelines'];
  const skillsToHighlight = candidateSkills.length > 0 ? candidateSkills.slice(0, 5) : ['JavaScript', 'React', 'Node.js', 'REST APIs', 'SQL'];
  const highImpactKeywords = ['Microservices', 'RESTful APIs', 'Database Optimization', 'State Management', 'Agile / Scrum', 'Version Control'];

  const projectChecklist = [
    'Quantify outcomes: include percentages, latency improvements, or user counts in project bullets.',
    'List all core technologies used in every project description (e.g. React, Express, MongoDB, Tailwind).',
    'Include direct hyperlinks to live deployed apps and GitHub source repositories.',
    'Detail API contracts, authentication flows (JWT/OAuth), and database schemas.'
  ];

  const certificationRecommendations = [
    { title: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', tag: 'Cloud' },
    { title: 'MongoDB Certified Developer Associate', issuer: 'MongoDB Inc.', tag: 'Database' },
    { title: 'Meta Front-End Developer Professional Certificate', issuer: 'Coursera / Meta', tag: 'Frontend' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Resume Assistant</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Resume Improvement Suggestions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Job-aligned keyword optimizations, skill recommendations, and project enhancement checklists.
          </p>
        </div>

        <Link
          to="/candidate/resume-upload"
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center gap-1.5 shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Updated Resume</span>
        </Link>
      </div>

      {!hasResume && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-900">
              You haven't uploaded a resume yet. Uploading your resume allows our NLP system to tailor these suggestions to your exact experience gaps.
            </p>
          </div>
          <Link
            to="/candidate/resume-upload"
            className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-lg whitespace-nowrap transition"
          >
            Upload Resume
          </Link>
        </div>
      )}

      {/* Row 1: Skills to Learn & Skills to Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Missing Skills to Learn */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>High-Demand Skills to Learn</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Competencies frequently required in hiring benchmarks:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {recommendedSkillsToLearn.map((s, idx) => (
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
            <span>Core Strengths to Emphasize</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Key competencies detected in your profile that match open roles:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {skillsToHighlight.map((s, idx) => (
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

      {/* Row 2: High-Impact Industry Keywords */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Recommended Industry Action Keywords</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Incorporate these high-value technical terms naturally in your project and experience bullet points:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {highImpactKeywords.map((kw, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Row 3: Project Checklist & Certification Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Suggestions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <FolderGit2 className="w-4 h-4 text-indigo-600" />
            <span>Project Description Enhancements</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600">
            {projectChecklist.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Certification Recommendations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Target Certification Pathways</span>
          </div>
          <div className="space-y-2">
            {certificationRecommendations.map((cert, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{cert.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{cert.issuer}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {cert.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
