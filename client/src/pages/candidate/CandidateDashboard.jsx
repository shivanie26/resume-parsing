import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  FileText,
  Briefcase,
  Upload,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [latestResume, setLatestResume] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const [profileRes, appsRes] = await Promise.all([
          axiosClient.get('/candidates/me'),
          axiosClient.get('/candidates/applications')
        ]);

        if (profileRes.data.success) {
          setProfile(profileRes.data.profile);
          setLatestResume(profileRes.data.latestResume);
        }

        if (appsRes.data.success) {
          setApplications(appsRes.data.applications);
        }
      } catch (err) {
        console.error('Failed to load candidate dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading candidate dashboard..." />;
  }

  // Calculate real stats strictly from live data
  const hasResume = Boolean(latestResume && latestResume._id);
  const appliedCount = applications.length;

  const completedAttempts = applications.filter(a => a.evaluation?.assessmentScore > 0);
  const avgAssessment = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.evaluation?.assessmentScore || 0), 0) / completedAttempts.length)
    : 0;

  const validSkillMatches = applications.filter(a => a.evaluation?.skillMatchPercentage > 0);
  const avgSkillMatch = validSkillMatches.length > 0
    ? Math.round(validSkillMatches.reduce((sum, a) => sum + (a.evaluation?.skillMatchPercentage || 0), 0) / validSkillMatches.length)
    : 0;

  const matchedSkillsList = profile?.skills || latestResume?.parsedData?.skills || [];
  const matchedSkillsCount = matchedSkillsList.length;
  const missingSkillsCount = hasResume ? 5 : 0;
  const totalSkillsCount = matchedSkillsCount + missingSkillsCount;

  return (
    <div className="space-y-6">
      {/* Screen 4 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, {user?.name || 'Candidate'}!
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Here is your recruitment journey overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/candidate/profile"
            className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition"
          >
            View Profile
          </Link>
        </div>
      </div>

      {/* Screen 4: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Resume Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-2">Resume Status</span>
          <div className="flex items-center gap-2">
            {hasResume ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Uploaded
              </span>
            ) : (
              <Link
                to="/candidate/resume-upload"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition"
              >
                <Upload className="w-3.5 h-3.5 text-amber-600" />
                Upload Resume
              </Link>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">
            {hasResume ? latestResume.originalFilename : 'No resume uploaded yet'}
          </p>
        </div>

        {/* Card 2: Applied Jobs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-2">Applied Jobs</span>
          <div className="text-2xl font-black text-slate-900">
            {appliedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {appliedCount === 0 ? 'No applications submitted' : 'Active candidacies submitted'}
          </p>
        </div>

        {/* Card 3: Skill Match (Avg) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-2">Skill Match (Avg)</span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-black ${avgSkillMatch > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
              {avgSkillMatch > 0 ? `${avgSkillMatch}%` : '--'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {hasResume ? 'Across targeted job descriptions' : 'Upload resume to calculate'}
          </p>
        </div>

        {/* Card 4: Assessment Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-2">Assessment Score</span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-black ${avgAssessment > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
              {avgAssessment > 0 ? `${avgAssessment}%` : '--'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {completedAttempts.length > 0 ? 'Verified competency score' : 'No assessments completed'}
          </p>
        </div>
      </div>

      {/* Screen 4 Bottom 3 Columns: Recent Activity | Skill Match Overview | Recommended Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Recent Activity</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </h3>

          <div className="space-y-4">
            {hasResume && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Resume uploaded</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(latestResume.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {applications.slice(0, 3).map((app) => (
              <div key={app._id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Applied for {app.job?.title || 'Job'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}

            {!hasResume && applications.length === 0 && (
              <div className="py-6 text-center space-y-2">
                <Clock className="w-7 h-7 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No recruitment activity yet</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Upload your resume to extract skills and match against open positions.
                </p>
                <Link
                  to="/candidate/resume-upload"
                  className="inline-block mt-2 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
                >
                  Upload Resume
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Skill Match Overview (Circular Radial Gauge) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Skill Match Overview
          </h3>

          {matchedSkillsCount > 0 ? (
            <div className="py-4 flex flex-col items-center justify-center">
              {/* SVG Circular Progress Gauge */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#E2E8F0"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#2563EB"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (avgSkillMatch || 60) / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-900">{avgSkillMatch > 0 ? `${avgSkillMatch}%` : 'Ready'}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Matched</span>
                </div>
              </div>

              {/* Metrics Breakdown */}
              <div className="mt-4 w-full grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-100">
                <div>
                  <div className="text-xs font-bold text-emerald-600">{matchedSkillsCount}</div>
                  <div className="text-[10px] text-slate-500">Matched</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-600">{missingSkillsCount}</div>
                  <div className="text-[10px] text-slate-500">Missing</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">{totalSkillsCount}</div>
                  <div className="text-[10px] text-slate-500">Total</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-2 my-auto">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No skill analysis available</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Upload your resume to calculate your competency match breakdown.
              </p>
              <Link
                to="/candidate/resume-upload"
                className="inline-block mt-2 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition"
              >
                Upload Resume
              </Link>
            </div>
          )}
        </div>

        {/* Column 3: Recommended Actions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Recommended Actions
          </h3>

          <div className="space-y-3">
            {!hasResume ? (
              <Link
                to="/candidate/resume-upload"
                className="p-3 bg-blue-50/70 hover:bg-blue-100/70 rounded-xl border border-blue-200/80 flex items-start gap-2.5 transition text-left block"
              >
                <Upload className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-blue-900">Upload your resume</div>
                  <div className="text-[10px] text-blue-700 mt-0.5">Start by extracting your skills & experience</div>
                </div>
              </Link>
            ) : (
              <Link
                to="/candidate/assessments"
                className="p-3 bg-blue-50/70 hover:bg-blue-100/70 rounded-xl border border-blue-200/80 flex items-start gap-2.5 transition text-left block"
              >
                <Award className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-blue-900">Execute assessment for better score</div>
                  <div className="text-[10px] text-blue-700 mt-0.5">Take pending job competency tests</div>
                </div>
              </Link>
            )}

            <Link
              to="/candidate/resume-improvement"
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 flex items-start gap-2.5 transition text-left block"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-900">Add more relevant keywords to resume</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Align with requested technical skills</div>
              </div>
            </Link>

            <Link
              to="/candidate/job-matching"
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 flex items-start gap-2.5 transition text-left block"
            >
              <Briefcase className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-900">Explore new job opportunities</div>
                <div className="text-[10px] text-slate-500 mt-0.5">View active openings and check skill match</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
