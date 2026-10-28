import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Cpu,
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Sliders,
  EyeOff,
  Database,
  Code
} from 'lucide-react';

export default function Features() {
  const featuresList = [
    {
      id: 'resume-parsing',
      title: 'Automated Resume Parsing',
      badge: 'NLP & Document Processing',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: FileText,
      iconColor: 'text-blue-600 bg-blue-50',
      summary: 'High-precision structured data extraction from native PDF and DOCX files without external paid APIs.',
      details: [
        'Extracts contact information, verified skills, educational qualifications, project history, and experience duration.',
        'Human-in-the-loop candidate review step ensures unverified OCR or text parsing results are never treated as infallible truth.',
        'Handles corrupted or scanned documents with clear error feedback and fallback guidance.'
      ]
    },
    {
      id: 'skill-matching',
      title: 'Deterministic AI Skill Matching',
      badge: 'Transparent Matching Engine',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      icon: Cpu,
      iconColor: 'text-sky-600 bg-sky-50',
      summary: 'Rule-based matching algorithm with comprehensive skill normalization and alias mapping.',
      details: [
        'Normalizes skill variations (e.g. ReactJS -> React, JS -> JavaScript, NodeJS -> Node.js) eliminating false negatives.',
        'Mathematical formula: (Matched Required Skills / Total Required Skills) × 100.',
        'Distinguishes between mandatory skills and bonus preferred skills with prioritized learning recommendations.'
      ]
    },
    {
      id: 'competency-assessment',
      title: 'Role-Specific Competency Assessment',
      badge: 'Server-Validated MCQ Exams',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Award,
      iconColor: 'text-indigo-600 bg-indigo-50',
      summary: 'Timed role-based technical MCQ examinations evaluated exclusively server-side.',
      details: [
        'Prevents client-side answer sniffing by never shipping answer keys to the frontend.',
        'Evaluates real hands-on technical proficiency beyond resume buzzwords and keyword stuffing.',
        'Generates instant topic-wise performance breakdowns, candidate strengths, and targeted improvement areas.'
      ]
    },
    {
      id: 'bias-aware-recruitment',
      title: 'Bias-Aware Anonymous Screening',
      badge: 'Fair & Objective Evaluation',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 bg-emerald-50',
      summary: 'Masks candidate personal identifiers during initial recruiter screening to prevent unconscious bias.',
      details: [
        'Assigns random unique Candidate IDs (e.g. CAND-001) during applicant ranking and comparison.',
        'Hides name, gender, age, email, phone number, address, and photographs from early filtering views.',
        'Explainable weighted scoring formula: 40% Skill Match + 40% Competency Assessment + 20% Verified Experience.'
      ]
    }
  ];

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>HireSmart Platform Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Comprehensive Platform Features
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Explore the technology pillars that power our bias-aware recruitment system,
          from NLP text extraction to explainable multi-factor scoring.
        </p>
      </div>

      {/* Feature Deep Dive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {featuresList.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.id}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${f.iconColor} flex items-center justify-center font-bold`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${f.badgeColor}`}>
                    {f.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.summary}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  {f.details.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Explainable Scoring Formula Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">
            Transparent Evaluation
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Explainable Multi-Factor Scoring Formula
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Unlike black-box AI match systems that produce opaque percentages, HireSmart computes
            a transparent, audit-ready weighted candidate evaluation score:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15">
            <span className="text-3xl font-black text-blue-400">40%</span>
            <h4 className="font-bold text-sm text-white mt-1">Skill Match Score</h4>
            <p className="text-[11px] text-slate-300 mt-1">
              Deterministic ratio of matched required skills verified against the job description.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15">
            <span className="text-3xl font-black text-indigo-400">40%</span>
            <h4 className="font-bold text-sm text-white mt-1">Assessment Score</h4>
            <p className="text-[11px] text-slate-300 mt-1">
              Objective server-graded score from role-specific technical MCQ testing.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15">
            <span className="text-3xl font-black text-emerald-400">20%</span>
            <h4 className="font-bold text-sm text-white mt-1">Experience & Projects</h4>
            <p className="text-[11px] text-slate-300 mt-1">
              Verified duration of relevant hands-on industry experience and technical projects.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap gap-4 items-center justify-between border-t border-white/10">
          <span className="text-xs text-blue-200 font-mono">
            Final Score = (0.40 × Skill Match) + (0.40 × Assessment) + (0.20 × Experience)
          </span>
          <Link
            to="/register"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <span>Try It Yourself</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
