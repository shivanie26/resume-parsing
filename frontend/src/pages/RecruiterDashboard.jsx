import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Briefcase, 
  FileText, 
  Users, 
  Award, 
  BarChart3, 
  PlusCircle, 
  Upload, 
  TrendingUp, 
  Sliders, 
  CheckCircle2, 
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie
} from 'recharts';

const RecruiterDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard/recruiter');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError('Failed to load recruiter analytics dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const { stats, distribution, topCandidates, skillsInDemand, categoryAverages, recentJobs } = data || {};

  const distributionChartData = distribution ? [
    { name: '90-100%', count: distribution['90-100%'] || 0, fill: '#10b981' },
    { name: '80-89%', count: distribution['80-89%'] || 0, fill: '#0284c7' },
    { name: '70-79%', count: distribution['70-79%'] || 0, fill: '#f59e0b' },
    { name: '< 70%', count: distribution['< 70%'] || 0, fill: '#ef4444' },
  ] : [];

  const categoryChartData = categoryAverages ? [
    { category: 'Technical', score: categoryAverages.TechnicalSkills || 0, fill: '#0284c7' },
    { category: 'Experience', score: categoryAverages.Experience || 0, fill: '#10b981' },
    { category: 'Projects', score: categoryAverages.Projects || 0, fill: '#6366f1' },
    { category: 'Education', score: categoryAverages.Education || 0, fill: '#8b5cf6' },
    { category: 'Certifications', score: categoryAverages.Certifications || 0, fill: '#f59e0b' }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Recruiter Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Smart Recruitment Analytics</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Overview of candidate evaluations, job postings, and competency scoring metrics.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/create-job"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> New Job Posting
          </Link>
          <Link
            to="/upload-resume"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-4 h-4" /> Batch Upload Resumes
          </Link>
          <Link
            to="/compare"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Sliders className="w-4 h-4" /> Compare Matrix
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="glass-card p-5 rounded-2xl border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Jobs</span>
            <span className="block text-3xl font-extrabold text-slate-900 mt-1">{stats?.totalJobs || 0}</span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Active Hiring Portals</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Resumes</span>
            <span className="block text-3xl font-extrabold text-slate-900 mt-1">{stats?.totalResumes || 0}</span>
            <span className="text-[11px] text-brand-600 font-semibold mt-1 inline-block">Parsed Documents</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Candidates Assessed</span>
            <span className="block text-3xl font-extrabold text-slate-900 mt-1">{stats?.candidatesAssessed || 0}</span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">AI Scoring Completed</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Match Score</span>
            <span className="block text-3xl font-extrabold text-slate-900 mt-1">{stats?.averageMatchScore || 0}%</span>
            <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">Competency Baseline</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Score Distribution Chart */}
        <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Candidate Score Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of assessed candidates by competency range</p>
            </div>
            <TrendingUp className="w-5 h-5 text-brand-600" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {distributionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Category Averages Chart */}
        <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Competency Category Performance</h3>
              <p className="text-xs text-slate-500">Average match percentage across evaluation dimensions</p>
            </div>
            <BarChart3 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} width={90} />
                <Tooltip 
                  formatter={(val) => [`${val}%`, 'Score']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-cat-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top Candidates Leaderboard Table & Recent Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Candidates Table */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Top Rated Candidates</h3>
              <p className="text-xs text-slate-500">Highest matching applicants based on objective competencies</p>
            </div>
            <Link to="/candidates" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
              View All <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="pb-3">Candidate</th>
                  <th className="pb-3">Overall Match</th>
                  <th className="pb-3">Tech Skill</th>
                  <th className="pb-3">Matched Skills</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {topCandidates && topCandidates.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-semibold text-slate-900">
                      <div>{c.name}</div>
                      <div className="text-[11px] font-normal text-slate-500">{c.email}</div>
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                        {c.overallScore}%
                      </span>
                    </td>
                    <td className="py-3 text-slate-700 font-semibold">{c.skillScore}%</td>
                    <td className="py-3 text-slate-600">{c.matchedSkillsCount} skills</td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/candidate-profile/${c.candidateId}`}
                        className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-bold hover:bg-brand-100 text-xs"
                      >
                        Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Job Postings List */}
        <div className="glass-card p-6 rounded-2xl border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base text-slate-900">Recent Job Postings</h3>
            <Link to="/create-job" className="text-xs font-bold text-brand-600 hover:underline">
              + Add
            </Link>
          </div>

          <div className="space-y-3">
            {recentJobs && recentJobs.map((job) => (
              <div key={job._id} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-brand-300 transition-all">
                <h4 className="font-bold text-sm text-slate-900">{job.title}</h4>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {job.requiredSkills && job.requiredSkills.slice(0, 3).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">Min Exp: {job.experienceRequirement} yrs</span>
                  <Link
                    to={`/job-rankings/${job._id}`}
                    className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                  >
                    View Applicants →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default RecruiterDashboard;
