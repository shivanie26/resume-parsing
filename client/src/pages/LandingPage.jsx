import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Cpu,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Users,
  Search,
  Lock,
  Target,
  Sliders,
  Check,
  Zap,
  TrendingUp,
  ChevronRight,
  Briefcase
} from 'lucide-react';

export default function LandingPage() {
  const [activeAudience, setActiveAudience] = useState('candidate');
  // Interactive Score Simulator
  const [skillScore, setSkillScore] = useState(85);
  const [examScore, setExamScore] = useState(90);
  const [expScore, setExpScore] = useState(80);

  // Calculate live weighted score: 40% skill + 40% exam + 20% experience
  const finalScore = Math.round(skillScore * 0.4 + examScore * 0.4 + expScore * 0.2);

  const getTier = (score) => {
    if (score >= 85) return { label: 'Top Candidate (Shortlisted)', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (score >= 70) return { label: 'Qualified for Interview', color: 'text-blue-700 bg-blue-50 border-blue-300' };
    if (score >= 60) return { label: 'Competency Passed', color: 'text-indigo-700 bg-indigo-50 border-indigo-300' };
    return { label: 'Review / Skill Gap Identified', color: 'text-amber-700 bg-amber-50 border-amber-300' };
  };

  const tier = getTier(finalScore);

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-16 pb-20 bg-gradient-to-b from-blue-50/70 via-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Audience Switcher Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl shadow-inner">
              <button
                type="button"
                onClick={() => setActiveAudience('candidate')}
                className={`py-2 px-5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeAudience === 'candidate'
                    ? 'bg-white text-blue-600 shadow-md shadow-blue-500/10'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>For Job Seekers & Candidates</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveAudience('recruiter')}
                className={`py-2 px-5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeAudience === 'recruiter'
                    ? 'bg-white text-blue-600 shadow-md shadow-blue-500/10'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>For Recruiters & Hiring Teams</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Next-Gen Smart Resume & Competency Platform</span>
              </div>

              {activeAudience === 'candidate' ? (
                <>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                    Get Hired on Real Skills, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Not Buzzwords.</span>
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                    Upload your resume in any PDF or Canva format. Our OCR and NLP engine extracts your verified skills, identifies gap areas, and lets you prove your proficiency via objective role-specific tests.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                    Hire Deterministically. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Zero Unconscious Bias.</span>
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                    Eliminate subjective guesswork and demographic bias. Screen candidates with anonymized profiles and transparent 40-40-20 explainable multi-factor scoring.
                  </p>
                </>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={activeAudience === 'candidate' ? '/register' : '/register?role=recruiter'}
                  className="px-7 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{activeAudience === 'candidate' ? 'Upload Resume & Get Started' : 'Post Jobs & Hire Smarter'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/features"
                  className="px-6 py-3.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl shadow-xs hover:border-slate-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <span>Explore All Features</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>EEOC 4/5ths Rule Compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>OCR for Canva & Scanned PDFs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                  <span>Cheating-Resistant Testing</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Score Calculator Widget */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl shadow-blue-600/10 border border-slate-200">
                {/* Header with Live Badge */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                      HS
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Live Scoring Simulator</div>
                      <div className="text-[10px] text-slate-400">Interactive 40-40-20 Engine</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Interactive
                  </span>
                </div>

                {/* Score Controls Sliders */}
                <div className="space-y-4">
                  {/* Skill Match */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Skill Match (40% Weight)</span>
                      <span className="text-blue-600 font-extrabold">{skillScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={skillScore}
                      onChange={(e) => setSkillScore(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                    />
                  </div>

                  {/* MCQ Exam Score */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>MCQ Competency (40% Weight)</span>
                      <span className="text-indigo-600 font-extrabold">{examScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={examScore}
                      onChange={(e) => setExamScore(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                    />
                  </div>

                  {/* Experience Score */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Experience & Projects (20% Weight)</span>
                      <span className="text-emerald-600 font-extrabold">{expScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={expScore}
                      onChange={(e) => setExpScore(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                    />
                  </div>
                </div>

                {/* Live Output Banner */}
                <div className="mt-5 p-4 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Deterministic Final Score
                    </span>
                    <span className="text-2xl font-black text-blue-600 bg-white px-3 py-0.5 rounded-xl border border-blue-200/80 shadow-xs">
                      {finalScore}%
                    </span>
                  </div>

                  <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center justify-between ${tier.color}`}>
                    <span>Ranking Verdict:</span>
                    <span>{tier.label}</span>
                  </div>

                  <p className="text-[10px] text-slate-500 text-center pt-1 font-mono">
                    ({skillScore} × 0.40) + ({examScore} × 0.40) + ({expScore} × 0.20) = {finalScore}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Feature Highlights Grid */}
          <div id="features" className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all text-center group cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">
                OCR & PDF Parsing
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Extracts skills and history even from flattened Canva and scanned image resumes via automated Tesseract OCR.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-sky-300 transition-all text-center group cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-xs">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">
                AI Skill Gap Analysis
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Categorizes missing skills into mandatory vs optional with tailored learning recommendations for candidates.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all text-center group cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">
                Verified Assessments
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cheating-resistant timed tests with focus monitoring eliminate keyword-stuffed claims with hard proof.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all text-center group cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">
                Adverse Impact Audit
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Anonymous screening masks demographic data, guaranteeing compliance with the federal EEOC 4/5ths fairness standard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Traditional vs HireSmart */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            Proven Architectural Paradigm
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Traditional ATS vs HireSmart
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Compare why conventional keyword scrapers fail while our deterministic engine delivers trusted hiring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional ATS Limitations */}
          <div className="bg-rose-50/40 border border-rose-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-rose-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg">
                ✕
              </div>
              <div>
                <h3 className="text-lg font-bold text-rose-950">Traditional Recruitment Limitations</h3>
                <p className="text-xs text-rose-700">Manual screening and keyword stuffing</p>
              </div>
            </div>
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold mt-0.5">•</span>
                <span><strong>Unreliable Keyword Matching:</strong> Misses synonymous skills and generates high false-positive rates.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold mt-0.5">•</span>
                <span><strong>Unverified Claims:</strong> Anyone can paste buzzwords into resumes without verified ability.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold mt-0.5">•</span>
                <span><strong>Unconscious Human Bias:</strong> Names, gender, and demographics introduce unintended hiring disparities.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold mt-0.5">•</span>
                <span><strong>Black-box AI Scores:</strong> Proprietary score algorithms with zero explanations or audit trails.</span>
              </li>
            </ul>
          </div>

          {/* HireSmart Solution */}
          <div className="bg-emerald-50/40 border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-emerald-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-950">HireSmart Solution</h3>
                <p className="text-xs text-emerald-700">Competency-validated, explainable & bias-free</p>
              </div>
            </div>
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                <span><strong>Skill Dictionary & Alias Normalization:</strong> Accurately matches variants (React = ReactJS, JS = JavaScript).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                <span><strong>Server-Side MCQ Validation:</strong> Tests actual hands-on depth with randomized questions and time limits.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                <span><strong>Anonymous Candidate IDs (CAND-XXXX):</strong> Completely masks PII during initial evaluation.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                <span><strong>Explainable 40-40-20% Weighted Score:</strong> Transparent mathematical formula verifiable by candidate and recruiter alike.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-500/20">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Experience Fair, Skill-First Recruitment?
            </h3>
            <p className="text-blue-100 text-xs sm:text-sm">
              Create your account in seconds and unlock automated resume scoring.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="px-7 py-3.5 bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-2xl transition shadow-lg cursor-pointer"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
