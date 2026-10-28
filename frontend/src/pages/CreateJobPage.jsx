import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, Sliders, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

const CreateJobPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('React, Node.js, JavaScript, SQL, REST API');
  const [preferredSkills, setPreferredSkills] = useState('Docker, AWS, MongoDB, TypeScript');
  const [experienceRequirement, setExperienceRequirement] = useState(3);
  const [educationRequirement, setEducationRequirement] = useState("Bachelor's Degree in Computer Science or Software Engineering");

  // Competency Weights state
  const [weights, setWeights] = useState({
    technicalSkills: 40,
    relevantExperience: 25,
    projects: 15,
    education: 10,
    certifications: 10
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalWeight = Object.values(weights).reduce((a, b) => a + Number(b), 0);

  const handleWeightChange = (key, val) => {
    setWeights(prev => ({
      ...prev,
      [key]: Number(val)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalWeight !== 100) {
      setError('Category weights must add up to exactly 100%. Current total: ' + totalWeight + '%');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/jobs', {
        title,
        description,
        requiredSkills,
        preferredSkills,
        experienceRequirement,
        educationRequirement,
        competencyWeights: weights
      });

      if (res.data.success) {
        navigate('/recruiter-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job posting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="glass-card p-8 rounded-2xl border-slate-200 shadow-xl space-y-8">
        
        <div>
          <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" /> Recruiter Management Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Create New Job Posting</h1>
          <p className="text-slate-500 text-sm mt-1">Configure job parameters and fine-tune competency evaluation weights.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-xl font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Job Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-sm"
              placeholder="e.g. Senior Full Stack Engineer (React + Node.js)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Job Description *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-sm"
              placeholder="Describe core job responsibilities, project scope, and technological framework..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Required Skills (Comma Separated)</label>
              <input
                type="text"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="React, Node.js, Python, SQL"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Essential skills mandatory for evaluation match</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Preferred Skills (Comma Separated)</label>
              <input
                type="text"
                value={preferredSkills}
                onChange={(e) => setPreferredSkills(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="AWS, Docker, Kubernetes"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Bonus skills providing extra score weight</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Minimum Required Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={experienceRequirement}
                onChange={(e) => setExperienceRequirement(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Education Requirement</label>
              <select
                value={educationRequirement}
                onChange={(e) => setEducationRequirement(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-sm bg-white"
              >
                <option value="Bachelor's Degree in Computer Science or Software Engineering">Bachelor's Degree (B.S. / B.Tech)</option>
                <option value="Master's Degree in Computer Science or Data Science">Master's Degree (M.S. / M.Tech)</option>
                <option value="Ph.D. in AI / Computer Science">Ph.D. Degree</option>
                <option value="Diploma or High School">Associate Degree / Diploma</option>
              </select>
            </div>
          </div>

          {/* Category Weight Sliders */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-600" /> Custom Category Weighting Configuration
                </h3>
                <p className="text-xs text-slate-500">Fine-tune the relative importance of each dimension during evaluation</p>
              </div>
              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                totalWeight === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                Total: {totalWeight}% {totalWeight === 100 ? '✓ Valid' : '⚠️ Must = 100%'}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Technical Skills</span>
                  <span>{weights.technicalSkills}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.technicalSkills}
                  onChange={(e) => handleWeightChange('technicalSkills', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Relevant Experience</span>
                  <span>{weights.relevantExperience}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.relevantExperience}
                  onChange={(e) => handleWeightChange('relevantExperience', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Demonstrated Projects</span>
                  <span>{weights.projects}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.projects}
                  onChange={(e) => handleWeightChange('projects', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Education Level</span>
                  <span>{weights.education}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.education}
                  onChange={(e) => handleWeightChange('education', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Certifications</span>
                  <span>{weights.certifications}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.certifications}
                  onChange={(e) => handleWeightChange('certifications', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>

            </div>
          </div>

          <button
            type="submit"
            disabled={loading || totalWeight !== 100}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Job Posting...' : <><Plus className="w-5 h-5" /> Publish Job Posting</>}
          </button>
        </form>

      </div>
    </div>
  );
};

export default CreateJobPage;
