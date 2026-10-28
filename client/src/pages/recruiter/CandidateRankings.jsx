import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScoreBadge from '../../components/ScoreBadge';
import {
  Award,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowUpDown,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';

export default function CandidateRankings() {
  const { jobId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assessmentFilter, setAssessmentFilter] = useState('');
  const [minSkillMatch, setMinSkillMatch] = useState('');

  const fetchRankings = async () => {
    try {
      const params = {};
      if (assessmentFilter) params.assessmentFilter = assessmentFilter;
      if (minSkillMatch) params.minSkillMatch = minSkillMatch;

      const res = await axiosClient.get(`/recruiter/jobs/${jobId}/rankings`, { params });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [jobId, assessmentFilter, minSkillMatch]);

  if (loading) {
    return <LoadingSpinner message="Calculating deterministic candidate rankings and score explanations..." />;
  }

  const { job, rankings = [] } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            Explainable AI / Rule-Based Ranking
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Candidate Rankings: {job?.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Transparent deterministic sorting: Fully evaluated candidates ordered by Final Score (40% Skill + 40% Exam + 20% Exp).
          </p>
        </div>

        <Link
          to={`/recruiter/reports/${jobId}`}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Evaluation Report & CSV Export
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold uppercase text-slate-600">Assessment:</span>
            <select
              value={assessmentFilter}
              onChange={(e) => setAssessmentFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="">All Candidates ({rankings.length})</option>
              <option value="completed">Completed Assessment Only</option>
              <option value="pending">Pending Assessment Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-600">Min Skill Match:</span>
            <select
              value={minSkillMatch}
              onChange={(e) => setMinSkillMatch(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="">Any Match</option>
              <option value="50">50% and above</option>
              <option value="70">70% and above</option>
              <option value="85">85% and above</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Showing {rankings.length} ranked candidate(s)
        </span>
      </div>

      {/* Rankings Cards / Table */}
      {rankings.length > 0 ? (
        <div className="space-y-4">
          {rankings.map((cand) => (
            <div
              key={cand.applicationId}
              className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 transition-all hover:shadow-md ${
                cand.rank === 1 ? 'border-indigo-400 ring-1 ring-indigo-300' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    cand.rank === 1
                      ? 'bg-amber-400 text-amber-950 shadow-sm'
                      : cand.rank === 2
                      ? 'bg-slate-200 text-slate-800'
                      : cand.rank === 3
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    #{cand.rank}
                  </span>

                  <div>
                    <span className="font-mono font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-xs">
                      {cand.candidateId}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">• {cand.candidateName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    cand.isFullyEvaluated
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {cand.isFullyEvaluated ? 'Fully Evaluated' : 'Assessment Pending'}
                  </span>

                  <ScoreBadge score={cand.finalScore} isPending={!cand.isFullyEvaluated} label="Final Score" />
                </div>
              </div>

              {/* Explainable Contributions Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Skill Match (40% Weight)
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {cand.skillMatchScore}% <span className="text-xs font-normal text-slate-500">({cand.skillMatchContribution} pts)</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Competency Exam (40% Weight)
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {cand.assessmentScore !== null ? `${cand.assessmentScore}%` : 'Pending'}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      ({cand.assessmentContribution} pts)
                    </span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Experience & Projects (20% Weight)
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {cand.experienceScore}% <span className="text-xs font-normal text-slate-500">({cand.experienceContribution} pts)</span>
                  </p>
                </div>
              </div>

              {/* Matched vs Missing Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-emerald-800 uppercase text-[10px] tracking-wider block mb-1">
                    Matched Required Competencies ({cand.matchedSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cand.matchedSkills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-rose-800 uppercase text-[10px] tracking-wider block mb-1">
                    Missing Required Competencies ({cand.missingSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cand.missingSkills.length > 0 ? (
                      cand.missingSkills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-rose-50 text-rose-800 rounded border border-rose-200">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-emerald-600 font-medium">None (All requirements met)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary Explanation */}
              {cand.explanation?.summary && (
                <p className="text-xs text-slate-600 italic bg-sky-50/50 p-2.5 rounded-lg border border-sky-100">
                  <strong>Evaluation Rationale:</strong> {cand.explanation.summary}
                </p>
              )}

              <div className="pt-2 flex justify-end">
                <Link
                  to={`/applications/${cand.applicationId}`}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800"
                >
                  View Full Candidate Dossier & Audit History →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Candidates Matched Criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust your filters to inspect more candidates.</p>
        </div>
      )}
    </div>
  );
}
