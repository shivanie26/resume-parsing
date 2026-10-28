import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Play,
  RotateCcw
} from 'lucide-react';

export default function CandidateAssessments() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await axiosClient.get('/candidates/applications');
        if (res.data.success) {
          setApplications(res.data.applications);
        }
      } catch (err) {
        console.error('Failed to load candidate assessments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading competency assessments hub..." />;
  }

  // Available standard test tracks
  const standardAssessments = [
    {
      role: 'fullstack',
      title: 'Full Stack Web Development Competency Exam',
      duration: '30 Minutes',
      questions: 20,
      skillsCovered: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST APIs'],
      targetRole: 'Full Stack Developer'
    },
    {
      role: 'python',
      title: 'Python & Backend Architecture Competency Exam',
      duration: '30 Minutes',
      questions: 20,
      skillsCovered: ['Python', 'Django/Flask', 'SQL', 'Data Structures', 'Async IO'],
      targetRole: 'Python Developer'
    },
    {
      role: 'aiml',
      title: 'AI/ML & Machine Learning Foundations Exam',
      duration: '30 Minutes',
      questions: 20,
      skillsCovered: ['Python', 'Machine Learning', 'NLP', 'TensorFlow', 'Data Preprocessing'],
      targetRole: 'AI/ML Engineer'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span>Anti-Cheat MCQ Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Role-Specific Competency Assessments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Validate hands-on technical skills through timed, server-graded examinations.
          </p>
        </div>
      </div>

      {/* Applied Job Assessments */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Your Job Application Assessments</h2>

        {applications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map((app) => {
              const hasScore = app.evaluation?.assessmentScore > 0;
              const isPending = app.status === 'Assessment Pending' || !hasScore;

              return (
                <div
                  key={app._id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {app.job?.targetRole || 'Technical Role'}
                      </span>
                      {hasScore ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Score: {app.evaluation.assessmentScore}%
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Pending Exam
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {app.job?.title || 'Technical Assessment'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {app.job?.company || 'Company'} • 20 Multiple-Choice Questions
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Weighted: 40% of final recruiter score
                    </span>

                    {isPending ? (
                      <Link
                        to={`/candidate/assessments/${app.job?._id}`}
                        className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Assessment</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/candidate/assessments/${app.job?._id}`}
                        className="px-4 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake Exam</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
            <Award className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Job Assessments Assigned Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Apply for any open position in the Job Matching section to automatically unlock its role-specific competency exam.
            </p>
            <Link
              to="/candidate/job-matching"
              className="inline-block mt-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
            >
              Browse Open Jobs
            </Link>
          </div>
        )}
      </div>

      {/* Standard Technical Assessments Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-slate-900">Standard Technical Benchmark Exams</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {standardAssessments.map((exam, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {exam.targetRole}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{exam.title}</h4>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {exam.duration}</span>
                  <span>•</span>
                  <span>{exam.questions} Questions</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {exam.skillsCovered.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                to="/candidate/job-matching"
                className="w-full text-center py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition block"
              >
                Match with {exam.targetRole} Jobs
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
