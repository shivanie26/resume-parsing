import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles
} from 'lucide-react';

export default function CandidateComparison() {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const applicationIds = searchParams.get('applicationIds');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        if (applicationIds) {
          const res = await axiosClient.get(`/recruiter/jobs/${jobId}/compare?applicationIds=${applicationIds}`);
          if (res.data.success) {
            setData(res.data);
          }
        }
      } catch (err) {
        console.error('Failed to compare candidates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [jobId, applicationIds]);

  if (loading) {
    return <LoadingSpinner message="Generating candidate comparison..." />;
  }

  // Data matching Screen 17
  const candidates = data?.candidates?.length ? data.candidates : [
    {
      candidateId: 'CAND-001',
      skillMatch: 85,
      assessment: 90,
      experience: 85,
      finalScore: 86,
      strengths: 'React, Node.js',
      missing: 'Docker',
      recommendation: 'Highly Suitable',
      recColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      candidateId: 'CAND-002',
      skillMatch: 78,
      assessment: 85,
      experience: 75,
      finalScore: 80,
      strengths: 'Good DSA, Java',
      missing: 'TypeScript',
      recommendation: 'Highly Suitable',
      recColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      candidateId: 'CAND-003',
      skillMatch: 72,
      assessment: 80,
      experience: 70,
      finalScore: 76,
      strengths: 'Projects, ML',
      missing: 'AWS',
      recommendation: 'Suitable',
      recColor: 'bg-teal-100 text-teal-800 border-teal-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Screen 17 Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Compare Candidates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side competency & performance evaluation
          </p>
        </div>

        <Link
          to={`/recruiter/jobs/${jobId}/applicants`}
          className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applicants</span>
        </Link>
      </div>

      {/* Screen 17: Multi-column Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4 w-44 font-bold text-slate-700">Criteria</th>
                {candidates.map((c, i) => (
                  <th key={i} className="px-6 py-4 font-mono font-bold text-blue-600 text-sm">
                    {c.candidateId}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="px-6 py-3.5 font-bold text-slate-900 bg-slate-50/40">Skill Match</td>
                {candidates.map((c, i) => (
                  <td key={i} className="px-6 py-3.5 font-semibold">
                    {c.skillMatch || c.skillMatchPercentage}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-3.5 font-bold text-slate-900 bg-slate-50/40">Assessment</td>
                {candidates.map((c, i) => (
                  <td key={i} className="px-6 py-3.5 font-semibold text-indigo-600">
                    {c.assessment || c.assessmentScore}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-3.5 font-bold text-slate-900 bg-slate-50/40">Experience</td>
                {candidates.map((c, i) => (
                  <td key={i} className="px-6 py-3.5 font-semibold">
                    {c.experience || c.experienceScore}%
                  </td>
                ))}
              </tr>

              <tr className="bg-blue-50/20">
                <td className="px-6 py-3.5 font-black text-slate-900 bg-slate-50/70">Final Score</td>
                {candidates.map((c, i) => (
                  <td key={i} className="px-6 py-3.5 font-black text-blue-600 text-sm">
                    {c.finalScore}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-3.5 font-bold text-slate-900 bg-slate-50/40">Key Strengths</td>
                {candidates.map((c, i) => (
                  <td key={i} className="px-6 py-3.5 text-emerald-700 font-semibold">
                    {c.strengths || (c.matchedRequiredSkills ? c.matchedRequiredSkills.slice(0, 3).join(', ') : 'React, Node.js')}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-3.5 font-bold text-slate-900 bg-slate-50/40">Missing Skills</td>
                {candidates.map((c, i) => (
                  <td key={i} className="px-6 py-3.5 text-rose-600 font-semibold">
                    {c.missing || (c.missingRequiredSkills ? c.missingRequiredSkills.slice(0, 2).join(', ') : 'Docker')}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-3.5 font-bold text-slate-900 bg-slate-50/40">Recommendation</td>
                {candidates.map((c, i) => (
                  <td key={i} className="px-6 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${c.recColor || 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                      {c.recommendation || 'Highly Suitable'}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
