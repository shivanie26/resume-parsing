import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScoreBadge from '../../components/ScoreBadge';
import {
  Users,
  Search,
  Filter,
  Eye,
  Award,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Briefcase,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function RecruiterCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedJob !== 'all') params.jobId = selectedJob;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await axiosClient.get('/recruiter/candidates', { params });
      if (res.data.success) {
        setCandidates(res.data.candidates || []);
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error('Error fetching recruiter candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [selectedJob, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates();
  };

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const res = await axiosClient.patch(`/applications/${appId}/status`, { status: newStatus });
      if (res.data.success) {
        setCandidates(prev =>
          prev.map(c => (c._id === appId ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusOptions = [
    'Applied',
    'Under Review',
    'Assessment Pending',
    'Assessment Completed',
    'Shortlisted',
    'Interview',
    'Selected',
    'Rejected'
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Anonymous Initial Screening
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Total Applicants: {candidates.length}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Candidate Pipeline & Screening
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review cross-job applications, objective score breakdowns, and advance candidates through the hiring pipeline.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/manage"
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
        >
          <Briefcase className="w-4 h-4 text-slate-500" />
          Manage Job Openings
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate ID, masked code, or job role..."
            className="w-full pl-9 pr-24 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {/* Job Filter */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Job:</span>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Jobs ({jobs.length})</option>
              {jobs.map(j => (
                <option key={j._id} value={j._id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Pipeline Table */}
      {loading ? (
        <LoadingSpinner message="Loading candidate applications..." />
      ) : candidates.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Candidate Code</th>
                  <th className="px-6 py-4">Applied Job Position</th>
                  <th className="px-6 py-4 text-center">Skill Match</th>
                  <th className="px-6 py-4 text-center">Exam Score</th>
                  <th className="px-6 py-4 text-center">Final Score</th>
                  <th className="px-6 py-4">Hiring Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Candidate */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 text-xs">
                            {c.candidateId}
                          </span>
                          {c.status === 'Interview' || c.status === 'Selected' ? (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {c.candidateName}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Name Masked
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Applied: {new Date(c.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>

                    {/* Job */}
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          to={`/recruiter/jobs/${c.job?._id}/applicants`}
                          className="font-bold text-slate-900 hover:text-blue-600 transition"
                        >
                          {c.job?.title || 'Job Opening'}
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {c.job?.department} • {c.job?.type}
                        </p>
                      </div>
                    </td>

                    {/* Skill Match */}
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-800">
                        {c.skillMatchScore}%
                      </span>
                    </td>

                    {/* Assessment */}
                    <td className="px-6 py-4 text-center">
                      {c.assessmentScore !== null ? (
                        <span className={`font-bold ${c.assessmentScore >= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {c.assessmentScore}%
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Final Score */}
                    <td className="px-6 py-4 text-center">
                      <ScoreBadge score={c.finalScore} size="sm" />
                    </td>

                    {/* Status with quick selector */}
                    <td className="px-6 py-4">
                      <select
                        value={c.status}
                        disabled={updatingId === c._id}
                        onChange={(e) => handleStatusChange(c._id, e.target.value)}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1 border transition focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                          c.status === 'Shortlisted' || c.status === 'Selected'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : c.status === 'Interview'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                            : c.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {statusOptions.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/recruiter/jobs/${c.job?._id}/rankings`}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1 transition"
                          title="View In Ranking"
                        >
                          <Award className="w-3.5 h-3.5" />
                          Rankings
                        </Link>
                        <Link
                          to={`/recruiter/reports/${c.job?._id}`}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition"
                          title="Evaluation Report"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          Report
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Candidates Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm || selectedJob !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your search criteria or filter filters.'
              : 'Candidates who apply to your job postings will appear here automatically.'}
          </p>
          {(searchTerm || selectedJob !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSelectedJob('all');
                setSelectedStatus('all');
                setSearchTerm('');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
