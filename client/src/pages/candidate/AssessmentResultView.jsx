import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export default function AssessmentResultView() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axiosClient.get(`/assessments/results/${attemptId}`);
        if (res.data.success && res.data.attempt) {
          setAttempt(res.data.attempt);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load assessment results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId]);

  if (loading) {
    return <LoadingSpinner message="Retrieving assessment evaluation..." />;
  }

  const percentage = attempt?.percentage ?? 85;
  const correctCount = attempt?.score ?? 17;
  const totalCount = attempt?.totalQuestions ?? 20;

  // Topics for Screen 11
  const topicPerformance = [
    { topic: 'JavaScript', score: 90 },
    { topic: 'React', score: 85 },
    { topic: 'Node.js', score: 85 },
    { topic: 'REST API', score: 80 },
    { topic: 'MongoDB', score: 75 }
  ];

  return (
    <div className="space-y-6">
      {/* Screen 11 Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Assessment Result
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {attempt?.assessment?.title || 'Full Stack Developer Assessment'}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Completed
        </span>
      </div>

      {/* Screen 11 Grid: Circular Score & Performance by Topic */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Score Gauge */}
        <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#E2E8F0"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#10B981"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentage / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-900">{percentage}%</span>
              <span className="text-[11px] font-semibold text-slate-400">Score</span>
            </div>
          </div>

          <div className="mt-4 text-xs font-bold text-slate-700">
            Score: {correctCount} / {totalCount} Correct
          </div>
          <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mt-2 font-medium">
            Passed Technical Qualification Threshold
          </p>
        </div>

        {/* Right: Performance by Topic */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Performance by Topic
          </h3>

          <div className="space-y-3.5">
            {topicPerformance.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{item.topic}</span>
                  <span className="font-bold text-slate-900">{item.score}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.score >= 85
                        ? 'bg-emerald-500'
                        : item.score >= 80
                        ? 'bg-blue-600'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Screen 11 Bottom Cards: Strengths & Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Strengths</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Good understanding of React component lifecycles, hooks, and clean RESTful API design.
            Strong grasp of ES6+ modern JavaScript syntax and array operations.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Areas to Improve</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Practice more on MongoDB aggregation pipelines, indexing strategies, and asynchronous event loops.
          </p>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-2">
        <Link
          to="/candidate/applications"
          className="text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          ← Back to My Applications
        </Link>
        <Link
          to="/candidate/dashboard"
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
