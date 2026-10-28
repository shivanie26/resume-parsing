import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  Award,
  Sparkles
} from 'lucide-react';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axiosClient.get('/candidates/applications');
        if (res.data.success) {
          setApplications(res.data.applications);
        }
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your submitted job applications..." />;
  }

  // Fallback demo items if no DB applications exist yet, matching Screen 13
  const displayApps = applications.length > 0 ? applications : [
    {
      _id: 'app-1',
      job: { _id: 'job-1', title: 'Full Stack Developer', company: 'TechWave Solutions' },
      appliedAt: '2026-09-12',
      status: 'Assessment Completed',
      evaluation: { finalScore: 86, assessmentScore: 90, skillMatchPercentage: 85 }
    },
    {
      _id: 'app-2',
      job: { _id: 'job-2', title: 'Python Developer', company: 'DataWorks' },
      appliedAt: '2026-09-10',
      status: 'Under Review',
      evaluation: { finalScore: 78, assessmentScore: 80, skillMatchPercentage: 78 }
    },
    {
      _id: 'app-3',
      job: { _id: 'job-3', title: 'AI/ML Engineer', company: 'InnovateAI' },
      appliedAt: '2026-09-08',
      status: 'Applied',
      evaluation: { finalScore: 72, assessmentScore: 0, skillMatchPercentage: 75 }
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Assessment Completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Assessment Completed
          </span>
        );
      case 'Under Review':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Under Review
          </span>
        );
      case 'Applied':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Applied
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Screen 13 Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            My Job Applications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track your application status.
          </p>
        </div>
        <Link
          to="/jobs"
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
        >
          Browse Open Positions
        </Link>
      </div>

      {/* Screen 13 Application Cards List */}
      <div className="space-y-4">
        {displayApps.map((app) => (
          <div
            key={app._id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-200 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {app.job?.title || 'Software Engineer'}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  {app.job?.company || 'Technology Solutions'}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Applied on {new Date(app.appliedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              {getStatusBadge(app.status)}

              <Link
                to={app.job?._id ? `/jobs/${app.job._id}` : '/jobs'}
                className="px-4 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition flex items-center gap-1.5"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
