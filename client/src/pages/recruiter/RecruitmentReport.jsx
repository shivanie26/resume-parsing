import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function RecruitmentReport() {
  const { jobId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axiosClient.get(`/recruiter/reports/${jobId}`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load evaluation report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [jobId]);

  const handleExportCSV = async () => {
    setDownloading(true);
    try {
      const response = await axiosClient.get(`/recruiter/reports/${jobId}/export`, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Evaluation_Report_${data?.job?.title?.replace(/\s+/g, '_') || 'Job'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download CSV export report.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Assembling recruitment audit report..." />;
  }

  const { job, generatedAt, totalCandidates, reportRows = [] } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Recruitment Audit Report
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Evaluation Report: {job?.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Department: {job?.department} • Generated on {new Date(generatedAt).toLocaleString()}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={downloading || reportRows.length === 0}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Generating CSV...' : 'Export to CSV File'}
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500">Total Applicants Evaluated</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{totalCandidates}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500">Mandatory Skills Benchmark</span>
          <p className="text-xs font-semibold text-slate-800 mt-1">
            {job?.requiredSkills?.join(', ')}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500">Audit Compliance</span>
          <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Bias-Aware & Deterministic Scoring
          </p>
        </div>
      </div>

      {/* Report Table */}
      {reportRows.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Rank</th>
                  <th className="px-6 py-3.5">Candidate ID</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Skill Match</th>
                  <th className="px-6 py-3.5">Exam Score</th>
                  <th className="px-6 py-3.5">Exp Score</th>
                  <th className="px-6 py-3.5">Final Score</th>
                  <th className="px-6 py-3.5">Matched Skills</th>
                  <th className="px-6 py-3.5">Missing Skills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportRows.map((row) => (
                  <tr key={row.rank} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-bold text-slate-800">
                      #{row.rank}
                    </td>
                    <td className="px-6 py-3 font-mono font-bold text-sky-900">
                      {row.candidateId}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold text-slate-700">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-900">
                      {row.skillMatchPercentage}
                    </td>
                    <td className="px-6 py-3 font-semibold text-indigo-700">
                      {row.assessmentScore}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {row.experienceScore}
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-900">
                      {row.finalScore}%
                    </td>
                    <td className="px-6 py-3 text-xs text-emerald-800 max-w-xs truncate" title={row.matchedSkills}>
                      {row.matchedSkills || 'None'}
                    </td>
                    <td className="px-6 py-3 text-xs text-rose-800 max-w-xs truncate" title={row.missingSkills}>
                      {row.missingSkills || 'None'}
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
          <h3 className="text-base font-bold text-slate-800">No Candidates Evaluated Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Applications for this position will appear here once candidates apply.
          </p>
        </div>
      )}
    </div>
  );
}
