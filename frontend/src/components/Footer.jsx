import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Compliance Banner */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-white text-sm font-semibold">Bias-Aware Recruitment Policy</h4>
              <p className="text-xs text-slate-300">
                Evaluation pipeline isolates and redacts sensitive PII (Gender, Religion, Caste, Race, Age, Photo). Scoring relies exclusively on job-relevant skills, experience, and educational qualifications.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 shrink-0 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Human Decision Required</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="font-extrabold text-lg text-white block">
              Smart<span className="text-brand-500">Resume</span> AI
            </span>
            <p className="text-xs mt-2 leading-relaxed text-slate-400">
              Academic Final-Year Project: Smart Resume Parsing, Semantic Competency Assessment, Bias Mitigation Layer & Explainable Candidate Scoring Engine.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Core Modules</h5>
            <ul className="space-y-1.5 text-xs">
              <li>✓ Resume Text Extraction & Structuring</li>
              <li>✓ Job Description Competency Weighting</li>
              <li>✓ Semantic Taxonomy Matching</li>
              <li>✓ Bias-Aware Scrubbing Layer</li>
              <li>✓ Explainable AI (XAI) Candidate Ranking</li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Academic Compliance</h5>
            <p className="text-xs leading-relaxed text-slate-400">
              This system provides automated decision-support information. AI recommendations do not replace final human recruitment oversight.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Smart Resume Parsing & Competency Assessment Platform. Final Year Engineering Demonstration.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
