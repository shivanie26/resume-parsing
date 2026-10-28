import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Trophy, 
  Award, 
  Download, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Briefcase,
  Play
} from 'lucide-react';

const RankingDashboardPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const fetchRankings = async () => {
    try {
      const [resJob, resRank] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/assessment/job/${jobId}/rankings`)
      ]);

      if (resJob.data.job) setJob(resJob.data.job);
      if (resRank.data.rankings) setRankings(resRank.data.rankings);
    } catch (err) {
      console.error('Fetch rankings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [jobId]);

  const handleEvaluateAll = async () => {
    setEvaluating(true);
    try {
      await api.post(`/assessment/evaluate-all/${jobId}`);
      await fetchRankings();
    } catch (err) {
      console.error('Batch evaluation error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const exportCSV = () => {
    if (rankings.length === 0) return;
    let csv = "Rank,Candidate Name,Email,Overall Score %,Skill Score %,Experience Score %,Education Score %,Matched Skills Count\n";
    rankings.forEach((r, idx) => {
      csv += `${idx + 1},"${r.candidateName}","${r.candidateEmail}",${r.overallScore},${r.skillScore},${r.experienceScore},${r.educationScore},${r.matchedSkills ? r.matchedSkills.length : 0}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Candidate_Rankings_${job?.title || 'Job'}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-card p-8 rounded-2xl border-slate-200 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4 text-amber-500" /> Candidate Ranking Leaderboard
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">{job?.title}</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Required Skills: {job?.requiredSkills ? job.requiredSkills.join(', ') : 'N/A'} | Min Exp: {job?.experienceRequirement || 0} Yrs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleEvaluateAll}
            disabled={evaluating}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Play className="w-4 h-4" /> {evaluating ? 'Evaluating...' : 'Run Batch Ranking'}
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Mandatory Human Oversight Banner */}
      <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl text-xs text-amber-900 font-bold flex items-center gap-2 shadow-xs">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <span>AI-assisted assessment — final recruitment decision must be made by a human recruiter.</span>
      </div>

      {/* Rankings Leaderboard Table */}
      <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="pb-3">Rank</th>
                <th className="pb-3">Candidate</th>
                <th className="pb-3">Overall Match</th>
                <th className="pb-3">Tech Skill</th>
                <th className="pb-3">Experience</th>
                <th className="pb-3">Education</th>
                <th className="pb-3">Matched Skills</th>
                <th className="pb-3 text-right">Explainable Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {rankings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No assessments calculated for this position yet. Click "Run Batch Ranking" to assess all candidate resumes.
                  </td>
                </tr>
              ) : (
                rankings.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 font-black text-sm text-slate-900">
                      {idx === 0 ? (
                        <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">🥇 1</span>
                      ) : idx === 1 ? (
                        <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center">🥈 2</span>
                      ) : idx === 2 ? (
                        <span className="w-7 h-7 rounded-full bg-amber-700/20 text-amber-900 flex items-center justify-center">🥉 3</span>
                      ) : (
                        `#${idx + 1}`
                      )}
                    </td>

                    <td className="py-4 font-bold text-slate-900">
                      <div>{c.candidateName}</div>
                      <div className="text-[11px] font-normal text-slate-500">{c.candidateEmail}</div>
                    </td>

                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-extrabold ${
                        c.overallScore >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-100 text-brand-800'
                      }`}>
                        {c.overallScore}%
                      </span>
                    </td>

                    <td className="py-4 text-slate-700 font-semibold">{c.skillScore}%</td>
                    <td className="py-4 text-slate-700 font-semibold">{c.experienceScore}%</td>
                    <td className="py-4 text-slate-700 font-semibold">{c.educationScore}%</td>

                    <td className="py-4 text-slate-600">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {c.matchedSkills && c.matchedSkills.slice(0, 3).map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 text-right">
                      <Link
                        to={`/assessment/${jobId}/${c.candidateId}`}
                        className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs inline-flex items-center gap-1"
                      >
                        Score Explanation <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default RankingDashboardPage;
