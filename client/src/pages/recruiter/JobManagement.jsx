import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Briefcase,
  Plus,
  Users,
  Award,
  FileSpreadsheet,
  Edit,
  Trash2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await axiosClient.get('/jobs');
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId, jobTitle) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the job posting "${jobTitle}"?`);
    if (!confirmDelete) return;

    setDeletingId(jobId);
    try {
      await axiosClient.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(j => j._id !== jobId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your job postings..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Manage Job Postings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review applicant pipelines, deterministic candidate rankings, and recruitment evaluation reports.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/create"
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md shadow-sky-600/30 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Create New Job Opening
        </Link>
      </div>

      {/* Jobs Table */}
      {jobs.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Job Position</th>
                  <th className="px-6 py-4">Role & Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assessment Exam</th>
                  <th className="px-6 py-4 text-right">Recruitment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          to={`/jobs/${job._id}`}
                          className="font-bold text-slate-900 hover:text-sky-600 text-sm"
                        >
                          {job.title}
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {job.department} • {job.location}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 block">{job.targetRole}</span>
                      <span className="text-xs text-slate-500">{job.type}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        job.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {job.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="capitalize font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {job.assessmentRole}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* View Applicants */}
                        <Link
                          to={`/recruiter/jobs/${job._id}/applicants`}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold flex items-center gap-1 transition"
                          title="View Applicants"
                        >
                          <Users className="w-3.5 h-3.5" />
                          Applicants
                        </Link>

                        {/* Candidate Rankings */}
                        <Link
                          to={`/recruiter/jobs/${job._id}/rankings`}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1 transition"
                          title="Deterministic Candidate Ranking"
                        >
                          <Award className="w-3.5 h-3.5" />
                          Rankings
                        </Link>

                        {/* Evaluation Report */}
                        <Link
                          to={`/recruiter/jobs/${job._id}/report`}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition"
                          title="Job Evaluation Report"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          Report
                        </Link>

                        {/* Edit */}
                        <Link
                          to={`/recruiter/jobs/edit/${job._id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                          title="Edit Job"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          type="button"
                          disabled={deletingId === job._id}
                          onClick={() => handleDelete(job._id, job.title)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition disabled:opacity-40"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Job Postings Created</h3>
          <p className="text-xs text-slate-500 mt-1">
            Publish your first position to start receiving and ranking applicants.
          </p>
          <Link
            to="/recruiter/jobs/create"
            className="mt-4 inline-block px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
          >
            Create Job
          </Link>
        </div>
      )}
    </div>
  );
}
