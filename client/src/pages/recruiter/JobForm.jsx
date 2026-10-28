import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Briefcase,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  FileSearch
} from 'lucide-react';

export default function JobForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote');
  const [type, setType] = useState('Full-time');
  const [description, setDescription] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [requiredSkills, setRequiredSkills] = useState(['React', 'Node.js', 'JavaScript']);
  const [newReqSkill, setNewReqSkill] = useState('');
  const [preferredSkills, setPreferredSkills] = useState(['Docker', 'AWS']);
  const [newPrefSkill, setNewPrefSkill] = useState('');
  const [minExperienceYears, setMinExperienceYears] = useState(2);
  const [educationRequirement, setEducationRequirement] = useState('Bachelor\'s degree in Computer Science or related field');
  const [assessmentRole, setAssessmentRole] = useState('fullstack');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchJob = async () => {
        try {
          const res = await axiosClient.get(`/jobs/${id}`);
          if (res.data.success && res.data.job) {
            const j = res.data.job;
            setTitle(j.title);
            setDepartment(j.department || 'Engineering');
            setLocation(j.location || 'Remote');
            setType(j.type || 'Full-time');
            setDescription(j.description || '');
            setTargetRole(j.targetRole || 'Full Stack Developer');
            setRequiredSkills(j.requiredSkills || []);
            setPreferredSkills(j.preferredSkills || []);
            setMinExperienceYears(j.minExperienceYears || 0);
            setEducationRequirement(j.educationRequirement || '');
            setAssessmentRole(j.assessmentRole || 'fullstack');
            if (j.deadline) {
              setDeadline(new Date(j.deadline).toISOString().split('T')[0]);
            }
          }
        } catch (err) {
          setError('Failed to load job details for editing.');
        } finally {
          setLoading(false);
        }
      };

      fetchJob();
    }
  }, [id, isEditMode]);

  const handleAddReqSkill = (e) => {
    e.preventDefault();
    if (newReqSkill.trim() && !requiredSkills.includes(newReqSkill.trim())) {
      setRequiredSkills([...requiredSkills, newReqSkill.trim()]);
      setNewReqSkill('');
    }
  };

  const handleRemoveReqSkill = (skill) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleAddPrefSkill = (e) => {
    e.preventDefault();
    if (newPrefSkill.trim() && !preferredSkills.includes(newPrefSkill.trim())) {
      setPreferredSkills([...preferredSkills, newPrefSkill.trim()]);
      setNewPrefSkill('');
    }
  };

  const handleRemovePrefSkill = (skill) => {
    setPreferredSkills(preferredSkills.filter(s => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (requiredSkills.length === 0) {
      setError('Please define at least one mandatory required skill.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title,
        department,
        location,
        type,
        description,
        targetRole,
        requiredSkills,
        preferredSkills,
        minExperienceYears: Number(minExperienceYears),
        educationRequirement,
        assessmentRole,
        deadline: deadline ? new Date(deadline) : undefined
      };

      if (isEditMode) {
        await axiosClient.put(`/jobs/${id}`, payload);
      } else {
        await axiosClient.post('/jobs', payload);
      }

      navigate('/recruiter/jobs/manage');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading job posting configuration..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Job Posting' : 'Create New Job Opening'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure technical competency requirements and assessment triggers.
          </p>
        </div>

        <Link
          to="/recruiter/jd-analyzer"
          className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition flex items-center gap-1.5"
        >
          <FileSearch className="w-3.5 h-3.5" />
          Auto-Extract from Job Description (JD Parser)
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Job Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Job Title & General Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer (React & Node.js)"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Engineering Role *</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Java Developer">Java Developer</option>
                <option value="Python Developer">Python Developer</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Custom">Custom Role</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Cloud Platform"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, Hybrid (San Francisco)"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description *</label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail core responsibilities, day-to-day tasks, and technical stack expectations..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Skill Requirements */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Technical Skill Requirements</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Defines the 40% Skill Match formula benchmark.
            </p>
          </div>

          {/* Mandatory Skills */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Mandatory Required Skills (Eligible for Score Contribution) *
            </label>
            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1.5"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveReqSkill(s)}
                    className="hover:text-rose-600 transition"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add skill (e.g. React, MongoDB)..."
                value={newReqSkill}
                onChange={(e) => setNewReqSkill(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
              <button
                type="button"
                onClick={handleAddReqSkill}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
              >
                Add
              </button>
            </div>
          </div>

          {/* Preferred Skills */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Preferred Bonus Skills (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {preferredSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemovePrefSkill(s)}
                    className="hover:text-rose-600 transition"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add preferred skill..."
                value={newPrefSkill}
                onChange={(e) => setNewPrefSkill(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
              <button
                type="button"
                onClick={handleAddPrefSkill}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Experience & Assessment Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Experience & Assessment Requirements</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Experience (Years)</label>
              <input
                type="number"
                min={0}
                max={20}
                value={minExperienceYears}
                onChange={(e) => setMinExperienceYears(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assessment Question Bank</label>
              <select
                value={assessmentRole}
                onChange={(e) => setAssessmentRole(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="fullstack">Full Stack Developer Exam</option>
                <option value="java">Java & Spring Boot Exam</option>
                <option value="aiml">AI / ML & NLP Exam</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Education Requirement</label>
              <input
                type="text"
                value={educationRequirement}
                onChange={(e) => setEducationRequirement(e.target.value)}
                placeholder="e.g. Bachelor's in Computer Science or related degree"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            to="/recruiter/jobs/manage"
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving Job Posting...' : isEditMode ? 'Update Job Posting' : 'Publish Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
