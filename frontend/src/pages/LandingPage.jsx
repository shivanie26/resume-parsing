import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  FileText, 
  Cpu, 
  BarChart3, 
  Award, 
  ArrowRight, 
  UserCheck, 
  Users,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';

const LandingPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Quick Demo Login Helper for Evaluator/Reviewer
  const quickDemoLogin = async (role) => {
    try {
      const email = role === 'recruiter' ? 'recruiter@platform.com' : 'alex.rivera@email.com';
      await login(email, 'password123');
      if (role === 'recruiter') {
        navigate('/recruiter-dashboard');
      } else {
        navigate('/candidate-dashboard');
      }
    } catch (err) {
      console.error('Demo login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
            Academic Final-Year AI/ML Capstone Project
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Smart Resume Parsing & <br />
            <span className="gradient-heading">Competency Assessment</span> Platform
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Automate resume ingestion, extract structured skills, score competencies against job requirements with explainable metrics, and eliminate non-job-relevant recruitment bias.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
            {!user ? (
              <>
                <button
                  onClick={() => quickDemoLogin('recruiter')}
                  className="px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
                >
                  <BarChart3 className="w-5 h-5" /> Demo Recruiter Access
                </button>
                <button
                  onClick={() => quickDemoLogin('candidate')}
                  className="px-6 py-3.5 rounded-xl font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2"
                >
                  <UserCheck className="w-5 h-5 text-brand-600" /> Demo Candidate Access
                </button>
              </>
            ) : (
              <Link
                to={user.role === 'recruiter' ? '/recruiter-dashboard' : '/candidate-dashboard'}
                className="px-6 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md transition-all flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Key Feature Stats Pills */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl glass-card text-center">
              <span className="block text-2xl font-black text-brand-600">100%</span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">PII Redaction</span>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center">
              <span className="block text-2xl font-black text-emerald-600">5-Dim</span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Competency Scoring</span>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center">
              <span className="block text-2xl font-black text-indigo-600">XAI</span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Explainable Evidence</span>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center">
              <span className="block text-2xl font-black text-amber-600">PDF & DOCX</span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Multi-Format Parser</span>
            </div>
          </div>

        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">End-to-End Processing Architecture</h2>
            <p className="text-slate-600 mt-2">How resumes are transformed into objective, explainable candidate assessments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-3">1</div>
              <h3 className="font-bold text-sm text-slate-900">Resume Upload</h3>
              <p className="text-xs text-slate-500 mt-1">Multi-file PDF & DOCX document ingestion</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold mb-3">2</div>
              <h3 className="font-bold text-sm text-slate-900">NLP Extraction</h3>
              <p className="text-xs text-slate-500 mt-1">Structured JSON entity extraction</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 text-center border-emerald-300 bg-emerald-50/40">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">3</div>
              <h3 className="font-bold text-sm text-slate-900">Bias-Aware Layer</h3>
              <p className="text-xs text-slate-600 mt-1">Scrubbing of sensitive PII & non-job attributes</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-3">4</div>
              <h3 className="font-bold text-sm text-slate-900">Semantic Match</h3>
              <p className="text-xs text-slate-500 mt-1">Taxonomy dictionary & weight evaluation</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold mb-3">5</div>
              <h3 className="font-bold text-sm text-slate-900">Explainable Rank</h3>
              <p className="text-xs text-slate-500 mt-1">Transparent score breakdown & evidence timeline</p>
            </div>

          </div>
        </div>
      </section>

      {/* Detailed Features Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900">Core Platform Modules</h2>
          <p className="text-slate-600 mt-2">Comprehensive suite built according to academic project specifications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-2xl glass-card hover:shadow-lg transition-all border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Structured Resume Parsing</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Extract candidate names, emails, education degrees, technical skills, certifications, work history, and total years of experience into validated JSON format.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card hover:shadow-lg transition-all border-emerald-200 bg-emerald-50/20">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Bias-Aware Mitigation</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Strictly isolates sensitive traits like gender, religion, caste, race, age, and photo references. Audits scoring factors to guarantee qualification-first evaluation.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card hover:shadow-lg transition-all border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Explainable AI (XAI)</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Provides granular rationale for every match score, including skill match percentages, experience deltas, missing competencies, and verbatim resume quotes.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card hover:shadow-lg transition-all border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Recruiter Dashboard</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Track active job postings, total candidate resumes, average score distribution charts, and skill demand heatmaps for data-driven hiring workflows.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card hover:shadow-lg transition-all border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Side-by-Side Candidate Matrix</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Select 2 to 4 candidates to run side-by-side competency comparisons across technical skills, experience, project relevance, and education scores.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card hover:shadow-lg transition-all border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Dynamic Competency Weighting</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Recruiters can adjust evaluation category weights (Technical 40%, Experience 25%, Projects 15%, Education 10%, Certifications 10%) per job requirements.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;
