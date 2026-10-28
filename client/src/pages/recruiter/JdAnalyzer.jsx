import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  FileSearch,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Trash2
} from 'lucide-react';

export default function JdAnalyzer() {
  const [jdText, setJdText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [extracted, setExtracted] = useState(null);

  const navigate = useNavigate();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!jdText.trim()) {
      setError('Please paste a job description text to parse.');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const res = await axiosClient.post('/jobs/parse-jd', { text: jdText });
      if (res.data.success && res.data.extractedRequirements) {
        setExtracted(res.data.extractedRequirements);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to parse job description.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateJobFromExtraction = () => {
    navigate('/recruiter/jobs/create');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            NLP Job Description Parser
          </span>
          <span className="text-xs text-slate-400">• Automated Extraction</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Parse Unstructured Job Descriptions into Requirements
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Paste any raw hiring description to extract required technical competencies, experience thresholds, and target engineering roles.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Text Area */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Paste Raw Job Description Text
        </label>
        <textarea
          rows={7}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste job posting text here (e.g. We are looking for a Senior Full Stack Engineer with 3+ years of experience in React, Node.js, and MongoDB)..."
          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
        />

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={() => setJdText(`We are looking for a skilled Senior Full Stack Developer with 3+ years of experience building modern web apps. The ideal candidate must be proficient in React, Node.js, Express.js, REST APIs, and MongoDB. Familiarity with Docker, Git, and AWS cloud architecture is preferred. Strong understanding of Data Structures and Algorithms is required.`)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Insert Sample Job Description
          </button>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !jdText.trim()}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {analyzing ? 'Extracting Requirements...' : 'Analyze & Extract Skills'}
          </button>
        </div>
      </div>

      {/* Extraction Results */}
      {extracted && (
        <div className="bg-white rounded-2xl border border-indigo-200 p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Parsed Job Requirements
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review extracted requirements before posting.
              </p>
            </div>

            <button
              onClick={handleCreateJobFromExtraction}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              Apply to Job Creator
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Detected Target Role</span>
              <p className="text-sm font-bold text-slate-900">{extracted.targetRole}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Min Experience Required</span>
              <p className="text-sm font-bold text-slate-900">{extracted.minExperienceYears} Year(s)</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Extracted Mandatory Required Skills ({extracted.requiredSkills.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {extracted.requiredSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {extracted.preferredSkills?.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Extracted Preferred Skills ({extracted.preferredSkills.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {extracted.preferredSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
