import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Building,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
  Upload
} from 'lucide-react';

export default function JobMatching() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [candidateSkills, setCandidateSkills] = useState([]);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, profileRes] = await Promise.all([
          axiosClient.get('/jobs'),
          axiosClient.get('/candidates/me')
        ]);

        if (jobsRes.data.success) {
          setJobs(jobsRes.data.jobs);
        }

        if (profileRes.data.success) {
          const skills = profileRes.data.profile?.skills || profileRes.data.latestResume?.parsedData?.skills || [];
          setCandidateSkills(skills);
          setHasResume(Boolean(profileRes.data.latestResume?._id));
        }
      } catch (err) {
        console.error('Failed to load job matching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate approximate match percentage client-side for immediate feedback
  const getJobMatchPercentage = (requiredSkills = []) => {
    if (!hasResume || requiredSkills.length === 0) return null;
    const lowerCandidateSkills = candidateSkills.map(s => s.toLowerCase());
    const matchedCount = requiredSkills.filter(req =>
      lowerCandidateSkills.some(cs => cs.includes(req.toLowerCase()) || req.toLowerCase().includes(cs))
    ).length;
    return Math.round((matchedCount / requiredSkills.length) * 100);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.department?.toLowerCase().includes(search.toLowerCase()) ||
      job.requiredSkills?.some(s => s.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = !targetRole || job.targetRole === targetRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <LoadingSpinner message="Loading job matching engine..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Competency Matcher</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Job Matching & Open Opportunities
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare your verified resume skills against job requirements in real-time.
          </p>
        </div>

        {!hasResume && (
          <Link
            to="/candidate/resume-upload"
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Resume for Match Scores</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, skill (e.g. React, Python), or keywords..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Technical Roles</option>
          <option value="Full Stack Developer">Full Stack Developer</option>
          <option value="Frontend Developer">Frontend Developer</option>
          <option value="Backend Developer">Backend Developer</option>
          <option value="AI/ML Engineer">AI/ML Engineer</option>
          <option value="Python Developer">Python Developer</option>
        </select>
      </div>

      {/* Job Cards Grid */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const matchScore = getJobMatchPercentage(job.requiredSkills);

            return (
              <div
                key={job._id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-200 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {job.targetRole || 'Engineering'}
                    </span>
                    <span className="text-xs text-slate-400">• {job.type || 'Full-time'}</span>
                    <span className="text-xs text-slate-400">• {job.location || 'Remote'}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{job.department || 'Engineering Division'}</p>
                  </div>

                  {/* Skills Pills */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400">Required Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredSkills?.map((skill, idx) => {
                        const isMatched = candidateSkills.some(cs => cs.toLowerCase() === skill.toLowerCase());
                        return (
                          <span
                            key={idx}
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${
                              isMatched
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Match Score & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {matchScore !== null ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Skill Match:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                        matchScore >= 75
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : matchScore >= 50
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {matchScore}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Upload resume for match %</span>
                  )}

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      to={`/candidate/jobs/${job._id}/match`}
                      className="px-3.5 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition"
                    >
                      Check Skill Match
                    </Link>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center gap-1 shadow-sm"
                    >
                      <span>View & Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Jobs Match Your Filters</h4>
            <p className="text-xs text-slate-400">Try clearing your search query or selecting a different role filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
