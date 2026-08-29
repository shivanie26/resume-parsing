import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, Search, Filter, Briefcase, Award, ExternalLink, Sliders } from 'lucide-react';

const CandidateListPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState('');
  const [expFilter, setExpFilter] = useState('');

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (skillFilter) params.skill = skillFilter;
      if (expFilter) params.minExperience = expFilter;

      const res = await api.get('/resumes/candidates', { params });
      if (res.data.success) {
        setCandidates(res.data.candidates);
      }
    } catch (err) {
      console.error('Fetch candidates error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [skillFilter, expFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-card p-6 rounded-2xl border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" /> Candidate Pool Directory
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Parsed Candidate Profiles</h1>
          <p className="text-slate-500 text-xs mt-1">Browse, filter, and compare candidate resumes ingested into the platform.</p>
        </div>

        <Link
          to="/compare"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
        >
          <Sliders className="w-4 h-4" /> Candidate Compare Matrix
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 glass-card p-4 rounded-xl border-slate-200">
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Filter by Skill</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. React, Python, AWS, SQL..."
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Min Experience (Years)</label>
          <select
            value={expFilter}
            onChange={(e) => setExpFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="">All Experience Levels</option>
            <option value="1">1+ Years</option>
            <option value="2">2+ Years</option>
            <option value="3">3+ Years</option>
            <option value="5">5+ Years</option>
          </select>
        </div>
      </div>

      {/* Candidates Cards Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center border-slate-200 text-slate-500">
          No candidates found matching the selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((c) => {
            const parsed = c.parsedData || {};
            return (
              <div key={c._id} className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm hover:border-brand-300 transition-all flex flex-col justify-between space-y-4">
                
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-base text-slate-900">{parsed.name || 'Candidate'}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700">
                      {parsed.total_experience || 0} Yrs Exp
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">{parsed.email || 'N/A'}</div>

                  <div className="text-xs font-semibold text-slate-700 pt-1">
                    Degree: {parsed.education && parsed.education[0] ? parsed.education[0].degree : 'Degree N/A'}
                  </div>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {parsed.skills && parsed.skills.slice(0, 5).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                        {s}
                      </span>
                    ))}
                    {parsed.skills && parsed.skills.length > 5 && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 text-[10px]">
                        +{parsed.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <Link
                    to={`/candidate-profile/${c.candidateId}`}
                    className="font-bold text-brand-600 hover:underline flex items-center gap-1"
                  >
                    View Full Profile <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to={`/resume-parsed/${c._id}`}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 font-medium text-slate-700"
                  >
                    Parsed JSON
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default CandidateListPage;
