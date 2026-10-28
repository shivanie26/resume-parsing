import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScoreBadge from '../../components/ScoreBadge';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Briefcase,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function JobMatchView() {
  const { id } = useParams();
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await axiosClient.post(`/jobs/${id}/match`);
        if (res.data.success) {
          setMatchData(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to calculate skill match.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Calculating deterministic skill match and gap analysis..." />;
  }

  if (error || !matchData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Skill Match Unavailable</h2>
        <p className="text-sm text-slate-500">{error || 'Please upload your resume to calculate skill match.'}</p>
        <Link
          to="/candidate/resume-upload"
          className="inline-block px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold"
        >
          Upload Resume
        </Link>
      </div>
    );
  }

  const { job, matchResult } = matchData;
  const {
    score,
    matchedRequiredSkills,
    missingRequiredSkills,
    matchedPreferredSkills,
    missingPreferredSkills,
    additionalSkills,
    gapAnalysis
  } = matchResult;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
              Deterministic Matching Engine
            </span>
            <span className="text-xs text-slate-400">• Transparent Criteria</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Skill-Gap Analysis for {job.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Formula: (Matched Required Skills / Total Required Skills) × 100
          </p>
        </div>

        <div className="flex flex-col items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl min-w-[160px] text-center">
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Skill Match</span>
          <div className="mt-1">
            <ScoreBadge score={score} size="lg" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            {matchedRequiredSkills.length} of {job.requiredSkills.length} Required Skills
          </span>
        </div>
      </div>

      {/* Matched vs Missing Breakdown Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Skills Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Verified Matched Skills</h2>
              <p className="text-xs text-slate-500">Skills present in your parsed resume</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
              Mandatory Requirements ({matchedRequiredSkills.length})
            </h3>
            {matchedRequiredSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matchedRequiredSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">None of the mandatory skills currently match.</p>
            )}
          </div>

          {matchedPreferredSkills.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-800 mb-2">
                Bonus Preferred Skills ({matchedPreferredSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {matchedPreferredSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Missing Skills Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Missing Competencies</h2>
              <p className="text-xs text-slate-500">Skills required by the job not found in resume</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-2">
              Missing Mandatory Skills ({missingRequiredSkills.length})
            </h3>
            {missingRequiredSkills.length > 0 ? (
              <div className="space-y-2">
                {missingRequiredSkills.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-rose-50/70 border border-rose-200 text-xs text-rose-900 flex items-start gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{s}</span>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        High Priority: Add verifiable project evidence or coursework if you know this skill.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-600 font-semibold">
                Outstanding! You meet 100% of the mandatory skill requirements!
              </p>
            )}
          </div>

          {missingPreferredSkills.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
                Missing Preferred Skills ({missingPreferredSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {missingPreferredSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    {s} (Good to have)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Learning Path Priority */}
      {gapAnalysis?.suggestedLearningPath?.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <BookOpen className="w-5 h-5" />
            <span>Recommended Learning Path to Bridge Competency Gaps</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {gapAnalysis.suggestedLearningPath.map((step, idx) => (
              <div key={idx} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="text-slate-200">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex justify-between items-center pt-4">
        <Link
          to={`/jobs/${job.id}`}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          ← Back to Job Details
        </Link>
        <Link
          to={`/candidate/resume-improvement/${job.id}`}
          className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 shadow-sm flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          View Detailed Resume Improvement Suggestions
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
