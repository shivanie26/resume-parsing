import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function AssessmentRunner() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [existingAttemptId, setExistingAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Runner state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionIndex }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await axiosClient.get(`/assessments/job/${jobId}`);
        if (res.data.alreadyCompleted) {
          setAlreadyCompleted(true);
          setExistingAttemptId(res.data.attemptId);
        } else if (res.data.success && res.data.assessment) {
          setAssessment(res.data.assessment);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load competency assessment.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [jobId]);

  const handleSelectOption = (qId, optionIdx) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [qId]: optionIdx
    });
  };

  const handleSubmit = async () => {
    if (!assessment) return;

    // Check unanswered questions
    const unansweredCount = assessment.questions.filter(
      q => selectedAnswers[q._id] === undefined
    ).length;

    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    setError('');

    try {
      const answersPayload = Object.entries(selectedAnswers).map(([questionId, selectedOptionIndex]) => ({
        questionId,
        selectedOptionIndex
      }));

      const res = await axiosClient.post(`/assessments/job/${jobId}/submit`, {
        answers: answersPayload
      });

      if (res.data.success && res.data.attemptId) {
        navigate(`/candidate/assessments/results/${res.data.attemptId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit assessment.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading role-specific competency examination..." />;
  }

  if (alreadyCompleted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Assessment Already Completed</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          You have already taken and submitted the competency assessment for this position.
          Scores are permanently recorded to preserve evaluation integrity.
        </p>
        <div className="pt-2">
          <Link
            to={`/candidate/assessments/results/${existingAttemptId}`}
            className="px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 shadow-sm"
          >
            View Your Evaluation Results
          </Link>
        </div>
      </div>
    );
  }

  if (error || !assessment || !assessment.questions || assessment.questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Assessment Unavailable</h2>
        <p className="text-sm text-slate-500">{error || 'No assessment questions found for this role.'}</p>
        <Link to="/candidate/dashboard" className="text-sm font-semibold text-sky-600 underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const currentQ = assessment.questions[currentIdx];
  const totalQ = assessment.questions.length;
  const isAnswered = selectedAnswers[currentQ._id] !== undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Info Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            Competency Validation Exam
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            {assessment.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Server-side answer evaluation • Contributes 40% to your Final Candidate Ranking Score
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>{assessment.durationMinutes} Minutes</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Progress Bar & Question Counter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Question {currentIdx + 1} of {totalQ}</span>
          <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            Topic: {currentQ.skillTopic || 'General'} • Difficulty: {currentQ.difficulty}
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-2 transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / totalQ) * 100}%` }}
          />
        </div>

        {/* Question Text */}
        <div className="pt-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentQ.questionText}
          </h2>
        </div>

        {/* 4 MCQ Radio Options */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map((optionText, optIdx) => {
            const isSelected = selectedAnswers[currentQ._id] === optIdx;
            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectOption(currentQ._id, optIdx)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-950 font-medium'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 border border-slate-300'
                }`}>
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="text-sm leading-relaxed">{optionText}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(currentIdx - 1)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-3">
            {currentIdx < totalQ - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Next Question →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
              >
                {submitting ? 'Scoring Assessment...' : 'Submit & Finish Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
