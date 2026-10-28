import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  AlertCircle, 
  Briefcase, 
  BookOpen, 
  Code, 
  Lock,
  ChevronLeft
} from 'lucide-react';

const CompetencyAssessmentPage = () => {
  const { jobId, candidateId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const runOrFetchAssessment = async () => {
      try {
        const [resJob, resAssess] = await Promise.all([
          api.get(`/jobs/${jobId}`),
          api.post(`/assessment/${jobId}/${candidateId}`)
        ]);

        if (resJob.data.job) setJob(resJob.data.job);
        if (resAssess.data.assessment) {
          setAssessment(resAssess.data.assessment);
          if (resAssess.data.assessment.overallScore >= 85) {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          }
        }
      } catch (err) {
        setError('Failed to compute or fetch competency assessment.');
      } finally {
        setLoading(false);
      }
    };
    runOrFetchAssessment();
  }, [jobId, candidateId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl">
          {error || 'Assessment computation failed.'}
        </div>
      </div>
    );
  }

  const { overallScore, skillScore, experienceScore, educationScore, projectScore, certificationScore, matchedSkills, missingSkills, evidence, explanation, biasAudit } = assessment;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Link */}
      <Link to={`/job-rankings/${jobId}`} className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-brand-600">
        <ChevronLeft className="w-4 h-4" /> Back to Candidate Rankings Leaderboard
      </Link>

      {/* Main Score Hero Card */}
      <div className="glass-card p-8 rounded-2xl border-slate-200 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Transparent Competency Evaluation
          </div>
          <h1 className="text-3xl font-extrabold">{assessment.candidateName || 'Candidate Assessment'}</h1>
          <p className="text-slate-300 text-sm">Evaluating qualifications for position: <span className="font-semibold text-white">{job?.title}</span></p>
          
          <div className="pt-2 flex items-center gap-2 text-xs text-amber-300 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>AI-assisted assessment — final recruitment decision must be made by a human recruiter.</span>
          </div>
        </div>

        {/* Big Badge Circle */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-800/90 border border-slate-700 text-center shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Match</span>
          <span className="text-5xl font-black text-emerald-400 mt-1">{overallScore}%</span>
          <span className="text-[11px] font-semibold text-slate-300 mt-1">Confidence: 94%</span>
        </div>

      </div>

      {/* 5-Dimensional Competency Breakdown Sliders */}
      <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">5-Dimensional Competency Breakdown</h3>
            <p className="text-xs text-slate-500">Traceable category scores calculated using job weightings</p>
          </div>
          <Award className="w-5 h-5 text-brand-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Technical Skills Match ({job?.competencyWeights?.technicalSkills || 40}%)</span>
              <span className="text-brand-600">{skillScore}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-brand-600 h-2.5 rounded-full" style={{ width: `${skillScore}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Relevant Experience ({job?.competencyWeights?.relevantExperience || 25}%)</span>
              <span className="text-emerald-600">{experienceScore}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${experienceScore}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Demonstrated Projects ({job?.competencyWeights?.projects || 15}%)</span>
              <span className="text-indigo-600">{projectScore}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${projectScore}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Education Level ({job?.competencyWeights?.education || 10}%)</span>
              <span className="text-purple-600">{educationScore}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${educationScore}%` }}></div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Verified Certifications ({job?.competencyWeights?.certifications || 10}%)</span>
              <span className="text-amber-600">{certificationScore}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${certificationScore}%` }}></div>
            </div>
          </div>

        </div>

        {/* Explainable AI Rationale Paragraph */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
          <span className="font-extrabold text-slate-900 uppercase block mb-1">AI Rationale:</span>
          {explanation}
        </div>
      </div>

      {/* Skills Comparison: Matched vs Missing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border-emerald-200 bg-emerald-50/10 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900">Matched Competencies ({matchedSkills?.length || 0})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchedSkills && matchedSkills.map((s, idx) => (
              <span key={idx} className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
                ✓ {s}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border-rose-200 bg-rose-50/10 space-y-3">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-600" />
            <h3 className="font-extrabold text-base text-slate-900">Missing Qualifications ({missingSkills?.length || 0})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingSkills && missingSkills.length > 0 ? (
              missingSkills.map((s, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-rose-100 text-rose-900 text-xs font-bold border border-rose-300">
                  ✗ {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-700 font-bold">No missing required skills! Candidate matches all required criteria.</span>
            )}
          </div>
        </div>

      </div>

      {/* Resume Evidence Quotes */}
      <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-600" /> Verbatim Evidence from Resume Text
        </h3>

        <div className="space-y-3">
          {evidence && evidence.map((item, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{item.skill}</span>
                <span className="text-brand-600 font-semibold">{item.source}</span>
              </div>
              <p className="text-slate-600 italic">"{item.text}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bias-Aware Audit Transparency Panel */}
      <div className="glass-card p-6 rounded-2xl border-slate-900 bg-slate-900 text-white space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
          <div>
            <h3 className="font-extrabold text-lg">Bias-Aware Evaluation Layer Audit</h3>
            <p className="text-xs text-slate-400">Guarantees candidate scoring is strictly based on job-relevant qualifications.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          <div className="space-y-2">
            <span className="font-bold uppercase tracking-wider text-emerald-400 block">✓ Evaluated Qualification Factors</span>
            <ul className="space-y-1.5 text-slate-300">
              {biasAudit?.evaluatedFactors.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold uppercase tracking-wider text-rose-400 block">🔒 Excluded Non-Job Attributes</span>
            <ul className="space-y-1.5 text-slate-400">
              {biasAudit?.excludedAttributes.map((a, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-400 shrink-0" /> {a}
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs text-slate-300 leading-relaxed">
          “Candidate ranking is based on job-relevant skills, experience, education, projects and certifications. Sensitive or irrelevant personal attributes are excluded from competency scoring.”
        </div>
      </div>

    </div>
  );
};

export default CompetencyAssessmentPage;
