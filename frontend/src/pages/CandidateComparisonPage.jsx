import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sliders, CheckCircle2, XCircle, Users, Award, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const CandidateComparisonPage = () => {
  const [candidatesList, setCandidatesList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCands, resJobs] = await Promise.all([
          api.get('/resumes/candidates'),
          api.get('/jobs')
        ]);

        if (resCands.data.candidates) {
          setCandidatesList(resCands.data.candidates);
          // Pre-select first 3 candidates for immediate demo
          const defaultIds = resCands.data.candidates.slice(0, 3).map(c => c.candidateId);
          setSelectedCandidateIds(defaultIds);
        }
        if (resJobs.data.jobs) {
          setJobsList(resJobs.data.jobs);
          if (resJobs.data.jobs.length > 0) setSelectedJobId(resJobs.data.jobs[0]._id);
        }
      } catch (err) {
        console.error('Fetch comparison initial data error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const runComparison = async () => {
    if (selectedCandidateIds.length < 2) return;
    try {
      const res = await api.post('/candidates/compare', {
        candidateIds: selectedCandidateIds,
        jobId: selectedJobId
      });
      if (res.data.success) {
        setComparison(res.data.comparison);
      }
    } catch (err) {
      console.error('Run comparison error:', err);
    }
  };

  useEffect(() => {
    if (selectedCandidateIds.length >= 2) {
      runComparison();
    }
  }, [selectedCandidateIds, selectedJobId]);

  const toggleCandidateSelection = (id) => {
    if (selectedCandidateIds.includes(id)) {
      if (selectedCandidateIds.length > 2) {
        setSelectedCandidateIds(selectedCandidateIds.filter(c => c !== id));
      }
    } else {
      if (selectedCandidateIds.length < 4) {
        setSelectedCandidateIds([...selectedCandidateIds, id]);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Format chart data for Recharts comparative bar chart
  const chartCategories = ['Overall', 'Technical Skills', 'Experience', 'Projects', 'Education'];
  const comparativeChartData = chartCategories.map(cat => {
    const row = { category: cat };
    comparison.forEach(c => {
      const scoreKey = cat === 'Overall' ? 'overallScore' :
                       cat === 'Technical Skills' ? 'skillScore' :
                       cat === 'Experience' ? 'experienceScore' :
                       cat === 'Projects' ? 'projectScore' : 'educationScore';
      row[c.name] = c.assessment ? c.assessment[scoreKey] : 0;
    });
    return row;
  });

  const colors = ['#0284c7', '#10b981', '#6366f1', '#f59e0b'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" /> Multi-Candidate Evaluation
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Side-by-Side Candidate Matrix</h1>
          <p className="text-slate-500 text-xs mt-1">Select 2 to 4 candidates for direct dimension-by-dimension competency comparison.</p>
        </div>

        {/* Job Selection Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Select Job Target:</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-semibold"
          >
            {jobsList.map(j => (
              <option key={j._id} value={j._id}>{j.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Selector Pills */}
      <div className="glass-card p-4 rounded-xl border-slate-200 space-y-2">
        <span className="text-xs font-bold uppercase text-slate-500 block">
          Select Candidates to Compare (2 to 4 Selected)
        </span>
        <div className="flex flex-wrap gap-2">
          {candidatesList.map(c => {
            const isSelected = selectedCandidateIds.includes(c.candidateId);
            return (
              <button
                key={c._id}
                onClick={() => toggleCandidateSelection(c.candidateId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  isSelected 
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}{c.parsedData?.name || 'Candidate'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparative Bar Chart Visualization */}
      <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 mb-4">Dimension Performance Comparison</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparativeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              {comparison.map((c, idx) => (
                <Bar key={c.candidateId} dataKey={c.name} fill={colors[idx % colors.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Matrix Table */}
      <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm overflow-x-auto">
        <h3 className="font-extrabold text-base text-slate-900 mb-4">Competency Comparison Matrix</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="pb-3 w-44">Competency Metric</th>
              {comparison.map((c, idx) => (
                <th key={idx} className="pb-3 text-center">
                  <div className="text-slate-900 font-extrabold text-sm">{c.name}</div>
                  <div className="text-[11px] font-normal text-slate-500">{c.email}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            
            <tr>
              <td className="py-3.5 font-bold text-slate-900">Overall Match Score</td>
              {comparison.map((c, idx) => (
                <td key={idx} className="py-3.5 text-center">
                  <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-sm">
                    {c.assessment?.overallScore || 0}%
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-3.5 font-bold text-slate-900">Technical Skills Match</td>
              {comparison.map((c, idx) => (
                <td key={idx} className="py-3.5 text-center font-bold text-slate-800">
                  {c.assessment?.skillScore || 0}%
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-3.5 font-bold text-slate-900">Relevant Experience</td>
              {comparison.map((c, idx) => (
                <td key={idx} className="py-3.5 text-center font-bold text-slate-800">
                  {c.assessment?.experienceScore || 0}% ({c.totalExperience} yrs)
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-3.5 font-bold text-slate-900">Projects Relevance</td>
              {comparison.map((c, idx) => (
                <td key={idx} className="py-3.5 text-center font-bold text-slate-800">
                  {c.assessment?.projectScore || 0}%
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-3.5 font-bold text-slate-900">Education Degree</td>
              {comparison.map((c, idx) => (
                <td key={idx} className="py-3.5 text-center text-slate-700 font-medium">
                  {c.education}
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-3.5 font-bold text-slate-900">Matched Skills</td>
              {comparison.map((c, idx) => (
                <td key={idx} className="py-3.5 text-center">
                  <div className="flex flex-wrap justify-center gap-1">
                    {c.assessment?.matchedSkills && c.assessment.matchedSkills.map((s, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-3.5 font-bold text-slate-900">Missing Competencies</td>
              {comparison.map((c, idx) => (
                <td key={idx} className="py-3.5 text-center">
                  <div className="flex flex-wrap justify-center gap-1">
                    {c.assessment?.missingSkills && c.assessment.missingSkills.length > 0 ? (
                      c.assessment.missingSkills.map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 text-[10px] font-semibold border border-rose-200">
                          ✗ {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-bold">None</span>
                    )}
                  </div>
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
};

export default CandidateComparisonPage;
