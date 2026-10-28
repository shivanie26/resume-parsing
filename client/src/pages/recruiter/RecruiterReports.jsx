import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  FileSpreadsheet,
  Download,
  Eye,
  Award,
  Users,
  CheckCircle2,
  Calendar,
  Briefcase,
  TrendingUp,
  ExternalLink
} from 'lucide-react';

export default function RecruiterReports() {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({ totalJobs: 0, totalApplicants: 0 });
  const [loading, setLoading] = useState(true);
  const [exportingId, setExportingId] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axiosClient.get('/recruiter/reports');
        if (res.data.success) {
          setReports(res.data.reports || []);
          setSummary({
            totalJobs: res.data.totalJobs || 0,
            totalApplicants: res.data.totalApplicants || 0
          });
        }
      } catch (err) {
        console.error('Failed to load recruiter reports overview:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleExportCSV = async (jobId, jobTitle) => {
    try {
      setExportingId(jobId);
      const res = await axiosClient.get(`/recruiter/reports/${jobId}/export`, {
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Evaluation_Report_${jobTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export CSV report: ' + (err.response?.data?.message || err.message));
    } finally {
      setExportingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating recruitment evaluation reports..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 w-fit mb-1">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Standardized Evaluation Documentation
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Candidate Evaluation Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Deterministic audit trails with complete score breakdowns (Skill Match, MCQ, Experience) and 1-click CSV export.
          </p>
        </div>

        <Link
          to="/recruiter/candidates"
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
        >
          <Users className="w-4 h-4 text-slate-500" />
          View All Candidates
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Postings</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{summary.totalJobs}</div>
          <div className="text-xs text-slate-400 mt-1">Audit-ready positions</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Evaluated</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{summary.totalApplicants}</div>
          <div className="text-xs text-slate-400 mt-1">Applicants scored</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Shortlisted Total</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {reports.reduce((acc, r) => acc + (r.shortlistedCount || 0), 0)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Qualified candidates</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Top Platform Score</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
            {reports.length > 0 ? Math.max(...reports.map(r => r.topScore || 0)) : 0}/100
          </div>
          <div className="text-xs text-slate-400 mt-1">Highest ranking match</div>
        </div>
      </div>

      {/* Reports Directory Table */}
      {reports.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Job Position Reports Directory</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select a job report to view rankings or download CSV</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Job Position</th>
                  <th className="px-6 py-4">Assessment Exam</th>
                  <th className="px-6 py-4 text-center">Applicants</th>
                  <th className="px-6 py-4 text-center">Evaluated</th>
                  <th className="px-6 py-4 text-center">Top Score</th>
                  <th className="px-6 py-4 text-center">Avg Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((job) => (
                  <tr key={job.jobId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Position */}
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          to={`/recruiter/reports/${job.jobId}`}
                          className="font-bold text-slate-900 hover:text-blue-600 transition"
                        >
                          {job.title}
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {job.department} • {job.type}
                        </p>
                      </div>
                    </td>

                    {/* Assessment Role */}
                    <td className="px-6 py-4">
                      <span className="capitalize font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {job.assessmentRole}
                      </span>
                    </td>

                    {/* Total Applicants */}
                    <td className="px-6 py-4 text-center font-bold text-slate-800">
                      {job.totalApplicants}
                    </td>

                    {/* Fully Evaluated */}
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-xs">
                        {job.fullyEvaluated}
                      </span>
                    </td>

                    {/* Top Score */}
                    <td className="px-6 py-4 text-center font-bold text-indigo-600">
                      {job.topScore}/100
                    </td>

                    {/* Avg Score */}
                    <td className="px-6 py-4 text-center font-bold text-slate-700">
                      {job.avgScore}/100
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Report */}
                        <Link
                          to={`/recruiter/reports/${job.jobId}`}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition flex items-center gap-1"
                          title="View Evaluation Report"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Report
                        </Link>

                        {/* Candidate Rankings */}
                        <Link
                          to={`/recruiter/jobs/${job.jobId}/rankings`}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs transition flex items-center gap-1"
                          title="View Deterministic Rankings"
                        >
                          <Award className="w-3.5 h-3.5" />
                          Rankings
                        </Link>

                        {/* Export CSV */}
                        <button
                          type="button"
                          disabled={exportingId === job.jobId}
                          onClick={() => handleExportCSV(job.jobId, job.title)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition flex items-center gap-1 disabled:opacity-50"
                          title="Download CSV Evaluation Report"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {exportingId === job.jobId ? 'Exporting...' : 'Export CSV'}
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
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Job Reports Available</h3>
          <p className="text-xs text-slate-500 mt-1">
            Create job postings and receive candidates to generate evaluation reports.
          </p>
          <Link
            to="/recruiter/jobs/create"
            className="mt-4 inline-block px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
          >
            Create Job Opening
          </Link>
        </div>
      )}
    </div>
  );
}
