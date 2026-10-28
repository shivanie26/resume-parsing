import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScoreBadge from '../../components/ScoreBadge';
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(null);
  const [applicationError, setApplicationError] = useState('');
  const [existingApplication, setExistingApplication] = useState(null);

  useEffect(() => {
    const fetchJobAndStatus = async () => {
      try {
        const res = await axiosClient.get(`/jobs/${id}`);
        if (res.data.success) {
          setJob(res.data.job);
        }

        // If candidate logged in, check if already applied
        if (user?.role === 'candidate') {
          const appRes = await axiosClient.get('/candidates/applications');
          if (appRes.data.success) {
            const found = appRes.data.applications.find(a => a.job?._id === id);
            if (found) setExistingApplication(found);
          }
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndStatus();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'candidate') {
      setApplicationError('Only candidate accounts can submit job applications.');
      return;
    }

    setApplying(true);
    setApplicationError('');

    try {
      const res = await axiosClient.post(`/jobs/${id}/apply`);
      if (res.data.success) {
        setApplicationSuccess(res.data);
        setExistingApplication(res.data.application);
      }
    } catch (err) {
      setApplicationError(
        err.response?.data?.message || err.message || 'Failed to submit application. Ensure you uploaded a resume first.'
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading job posting..." />;
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <Link to="/jobs" className="mt-4 inline-block text-sm font-semibold text-sky-600 hover:underline">
          Return to Job Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Job Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200">
              {job.targetRole}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500 mt-2">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Building className="w-4 h-4 text-slate-400" />
                {job.recruiter?.company || 'Employer'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                {job.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4 text-slate-400" />
                {job.type}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                {job.deadline ? `Deadline: ${new Date(job.deadline).toLocaleDateString()}` : 'Open Until Filled'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <Link
              to={`/candidate/jobs/${job._id}/match`}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4 text-sky-600" />
              Check Skill Match
            </Link>

            {existingApplication ? (
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Applied ({existingApplication.status})
                </span>
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 shadow-md shadow-sky-600/30 transition flex items-center justify-center gap-2"
              >
                {applying ? 'Submitting Application...' : 'One-Click Apply'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Success & Error Banners */}
        {applicationSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-sm text-emerald-900">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Application Submitted Successfully!</span>
            </div>
            <p className="text-xs text-emerald-800">
              Your resume was parsed and scored. Provisional Score: <strong>{applicationSuccess.evaluation?.finalScore}%</strong>.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link
                to={`/candidate/assessments/${job._id}`}
                className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition"
              >
                Take Role Competency Assessment Now
              </Link>
              <Link
                to={`/candidate/resume-improvement/${job._id}`}
                className="text-xs font-semibold text-emerald-800 hover:underline"
              >
                View Skill-Gap & Resume Suggestions
              </Link>
            </div>
          </div>
        )}

        {applicationError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to apply</p>
              <p className="text-xs mt-0.5">{applicationError}</p>
              {applicationError.includes('resume') && (
                <Link
                  to="/candidate/resume-upload"
                  className="mt-2 inline-block text-xs font-bold text-sky-700 underline"
                >
                  Upload your resume first
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Description & Competencies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Description Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Job Description & Responsibilities</h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Academic & Experience Prerequisites</h3>
              <p className="text-xs text-slate-600">
                • <strong>Minimum Relevant Experience:</strong> {job.minExperienceYears} year(s)
              </p>
              <p className="text-xs text-slate-600">
                • <strong>Education:</strong> {job.educationRequirement}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar: Required Skills & Assessment Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Mandatory Skills (40% Weight)</h3>
            <p className="text-xs text-slate-500">
              Required for shortlisting eligibility. Checked against your parsed resume.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {job.requiredSkills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200"
                >
                  {skill}
                </span>
              ))}
            </div>

            {job.preferredSkills && job.preferredSkills.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Preferred Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.preferredSkills.map((ps, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
                    >
                      {ps}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-indigo-50/50 rounded-2xl border border-indigo-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Competency Assessment Required</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This position includes a role-specific MCQ evaluation (40% of final ranking score).
              After applying, you will be invited to take the test.
            </p>
            {existingApplication && (
              <Link
                to={`/candidate/assessments/${job._id}`}
                className="mt-2 block w-full text-center py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
              >
                Go to Assessment Test
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
