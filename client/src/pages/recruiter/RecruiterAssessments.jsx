import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Award,
  Clock,
  CheckCircle2,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Briefcase
} from 'lucide-react';

export default function RecruiterAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await axiosClient.get('/recruiter/assessments');
        if (res.data.success) {
          setAssessments(res.data.assessments || []);
          if (res.data.assessments?.length > 0) {
            setExpandedId(res.data.assessments[0]._id || res.data.assessments[0].role);
          }
        }
      } catch (err) {
        console.error('Failed to load assessments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading competency assessment banks..." />;
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1 w-fit mb-1">
            <Award className="w-3.5 h-3.5" />
            Standardized Competency Testing
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Assessment Question Banks & Benchmarks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Objective role-specific technical assessments used to compute 40% of deterministic candidate ranking.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/create"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition flex items-center gap-1.5"
        >
          <Briefcase className="w-4 h-4" />
          Attach Test to New Job
        </Link>
      </div>

      {/* Info Card: Cheating Resistance & Evaluation Logic */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-5 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs sm:text-sm text-slate-700 space-y-1">
          <h3 className="font-bold text-slate-900 text-sm">Automated Cheating-Resistant Test Delivery</h3>
          <p className="text-slate-600">
            Assessments enforce browser focus monitoring (tab switch alerts), strict countdown timers, and randomized question order.
            Scores directly feed into deterministic candidate evaluations (Skill Match 40% + Assessment 40% + Experience 20%).
          </p>
        </div>
      </div>

      {/* Assessment Question Banks List */}
      <div className="space-y-4">
        {assessments.map((assessment) => {
          const id = assessment._id || assessment.role;
          const isExpanded = expandedId === id;

          return (
            <div
              key={id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition"
            >
              {/* Card Header / Summary */}
              <div
                onClick={() => toggleExpand(id)}
                className="p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {assessment.role}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Pass Mark: {assessment.passingScore}%
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {assessment.durationMinutes} mins
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        {assessment.totalQuestions || assessment.questions?.length} MCQs
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {assessment.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {assessment.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold text-blue-600 hidden sm:inline">
                    {isExpanded ? 'Hide Questions' : 'Preview MCQs'}
                  </span>
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Questions Bank */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Question Bank Preview ({assessment.questions?.length || 0} Questions)
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Randomized per candidate session
                    </span>
                  </div>

                  <div className="space-y-4">
                    {assessment.questions?.map((q, idx) => (
                      <div
                        key={q._id || idx}
                        className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {q.skillTopic || 'Topic'}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              q.difficulty === 'easy'
                                ? 'bg-emerald-50 text-emerald-700'
                                : q.difficulty === 'hard'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {q.difficulty || 'medium'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-slate-800">
                          {q.questionText}
                        </p>

                        {/* Options List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options?.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2"
                            >
                              <span className="font-bold text-slate-400 font-mono">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>

                        {q.explanation && (
                          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-800 text-xs flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Evaluation Rationale: </span>
                              <span>{q.explanation}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
