import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  FileCheck2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

export default function ResumeReview() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('id');
  const warningMsg = searchParams.get('warning');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editable parsed fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);

  useEffect(() => {
    if (!resumeId) {
      navigate('/candidate/resume-upload');
      return;
    }

    const fetchResume = async () => {
      try {
        const res = await axiosClient.get(`/resumes/${resumeId}`);
        if (res.data.success && res.data.resume) {
          const parsed = res.data.resume.parsedData || {};
          setName(parsed.name || '');
          setEmail(parsed.email || '');
          setPhone(parsed.phone || '');
          setSummary(parsed.summary || '');
          setSkills(parsed.skills || []);
          setEducation(parsed.education || []);
          setExperience(parsed.experience || []);
          setProjects(parsed.projects || []);
          setCertifications(parsed.certifications || []);
        }
      } catch (err) {
        setErrorMsg('Failed to load parsed resume data.');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [resumeId, navigate]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Education handlers
  const handleAddEducation = () => {
    setEducation([
      ...education,
      { degree: '', institution: '', fieldOfStudy: '', year: '' }
    ]);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  // Project handlers
  const handleAddProject = () => {
    setProjects([
      ...projects,
      { title: '', description: '', technologies: [] }
    ]);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleProjectChange = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  // Certification handlers
  const handleAddCertification = () => {
    setCertifications([
      ...certifications,
      { title: '', issuer: '', year: '' }
    ]);
  };

  const handleRemoveCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleCertificationChange = (index, field, value) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        name,
        email,
        phone,
        summary,
        skills,
        education,
        experience,
        projects,
        certifications
      };

      const res = await axiosClient.put(`/resumes/${resumeId}/parsed-data`, payload);
      if (res.data.success) {
        setSuccessMsg('Resume details corrected and saved successfully.');
        setTimeout(() => {
          navigate('/candidate/profile');
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading extracted resume details..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Extraction Complete
            </span>
            <span className="text-xs text-slate-400">• Review Step</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Review & Correct Extracted Resume Data
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            AI parsers are assistive and may miss formatting nuances. Verify your skills and credentials below before applying.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/30 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save & Continue to Jobs'}
        </button>
      </div>

      {warningMsg && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Document Notice</p>
            <p className="mt-0.5">{warningMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Basic Contact Info Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Extracted Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Summary</label>
          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Technical Skills Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              Extracted Technical Skills
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These competencies will be matched against job requirements. Add any missing skills.
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {skills.length} skills
          </span>
        </div>

        {/* Skill Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="hover:text-rose-600 transition-colors"
                title="Remove Skill"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Add Skill Input */}
        <form onSubmit={handleAddSkill} className="flex gap-2 max-w-md pt-2">
          <input
            type="text"
            placeholder="Add missing skill (e.g., Docker, Spring Boot)..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            className="px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Skill
          </button>
        </form>
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Technical Projects</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Projects provide practical evidence evaluated in your Experience Score (20%).
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddProject}
            className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Project
          </button>
        </div>

        <div className="space-y-4">
          {projects.map((proj, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
              <button
                type="button"
                onClick={() => handleRemoveProject(idx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-600"
                title="Remove Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="pr-8">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  value={proj.title}
                  onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                  placeholder="e.g. Full-Stack E-Commerce Platform"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Impact</label>
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                  placeholder="Describe technologies used, architecture, and features..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-600" />
              Certifications & Credentials
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Certifications validate specialized training, courses, and hackathon accomplishments.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddCertification}
            className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Certification
          </button>
        </div>

        <div className="space-y-4">
          {certifications.map((cert, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
              <button
                type="button"
                onClick={() => handleRemoveCertification(idx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-600"
                title="Remove Certification"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Certification Title / Award</label>
                  <input
                    type="text"
                    value={cert.title || cert.name || ''}
                    onChange={(e) => handleCertificationChange(idx, 'title', e.target.value)}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Issuer / Organization</label>
                  <input
                    type="text"
                    value={cert.issuer || ''}
                    onChange={(e) => handleCertificationChange(idx, 'issuer', e.target.value)}
                    placeholder="e.g. Amazon Web Services, NPTEL"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
          {certifications.length === 0 && (
            <div className="py-4 text-center text-xs text-slate-400">
              No certifications added yet. Click &quot;Add Certification&quot; above to include your credentials.
            </div>
          )}
        </div>
      </div>

      {/* Save Action Bottom Bar */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/30 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Confirm Details & Explore Jobs'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
