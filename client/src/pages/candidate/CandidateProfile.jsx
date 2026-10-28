import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Linkedin,
  Github,
  Edit3,
  Save,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Layers,
  FolderGit2,
  Award,
  Globe,
  Plus,
  Trash2
} from 'lucide-react';

export default function CandidateProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Personal Details');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fields matching Screen 5
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('Candidate Profile');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [location, setLocation] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosClient.get('/candidates/me');
        if (res.data.success && res.data.profile) {
          const p = res.data.profile;
          const resumeParsed = res.data.latestResume?.parsedData || {};

          setFullName(p.contactDetails?.name || resumeParsed.name || user?.name || '');
          setEmail(p.contactDetails?.email || resumeParsed.email || user?.email || '');
          if (p.contactDetails?.phone || resumeParsed.phone) setPhone(p.contactDetails?.phone || resumeParsed.phone);
          if (p.contactDetails?.location) setLocation(p.contactDetails.location);
          if (p.contactDetails?.linkedin) setLinkedin(p.contactDetails.linkedin);
          if (p.contactDetails?.github) setGithub(p.contactDetails.github);

          const loadedSkills = (p.skills && p.skills.length > 0) ? p.skills : (resumeParsed.skills || []);
          setSkills(loadedSkills);

          const loadedEducation = (p.education && p.education.length > 0) ? p.education : (resumeParsed.education || []);
          setEducation(loadedEducation);

          const loadedProjects = (p.projects && p.projects.length > 0) ? p.projects : (resumeParsed.projects || []);
          setProjects(loadedProjects);

          const rawCerts = (p.certifications && p.certifications.length > 0) ? p.certifications : (resumeParsed.certifications || []);
          const cleanCerts = [];
          const detectedLanguages = (p.languages && p.languages.length > 0) ? [...p.languages] : (resumeParsed.languages ? [...resumeParsed.languages] : []);

          const isLanguageStr = (str) => {
            if (!str) return false;
            return /^(languages?|spoken languages?)$/i.test(str.trim()) ||
              /\b(english|telugu|tamil|hindi|french|german|spanish|malayalam|kannada|marathi|bengali|gujarati)\b/i.test(str) ||
              /\b(intermediate|fluent|native|proficient)\b/i.test(str);
          };

          for (const cert of rawCerts) {
            const title = cert.title || cert.name || '';
            if (isLanguageStr(title)) {
              const items = title.split(/[—–|,]/).map(l => l.trim()).filter(Boolean);
              for (const item of items) {
                if (isLanguageStr(item) && !detectedLanguages.includes(item)) {
                  detectedLanguages.push(item);
                }
              }
            } else if (!/^(languages?)$/i.test(title.trim())) {
              cleanCerts.push(cert);
            }
          }

          setCertifications(cleanCerts);
          setLanguages(detectedLanguages);
        } else {
          setFullName(user?.name || '');
          setEmail(user?.email || '');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const payload = {
        contactDetails: { name: fullName, email, phone, location, linkedin, github },
        skills,
        education,
        projects,
        certifications,
        languages
      };
      const res = await axiosClient.put('/candidates/me', payload);
      if (res.data.success) {
        setSuccess('Profile updated successfully.');
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = ['Personal Details', 'Education', 'Skills', 'Projects', 'Certifications', 'Languages'];

  if (loading) {
    return <LoadingSpinner message="Loading candidate profile..." />;
  }

  return (
    <div className="space-y-6">
      {/* Screen 5 Top Profile Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {fullName ? fullName.charAt(0).toUpperCase() : 'Y'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {fullName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {headline}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                Candidate
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {user?.candidateId || 'CAND-001'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition flex items-center gap-1.5"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Screen 5: Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'Personal Details' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
                  >
                    {saving ? 'Saving...' : 'Save Personal Details'}
                  </button>
                </div>
              )}
            </form>
          )}

          {activeTab === 'Education' && (
            <div className="space-y-4">
              {education.length > 0 ? (
                education.map((edu, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{edu.degree || edu.institution || 'Education Credential'}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{edu.institution || edu.fieldOfStudy}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                        {edu.year || edu.endYear ? <span>{edu.year || edu.endYear}</span> : null}
                        {edu.grade || edu.fieldOfStudy ? (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-blue-600">{edu.grade || edu.fieldOfStudy}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No education history added yet. Upload your resume to extract educational details automatically.
                </div>
              )}
            </div>
          )}

          {activeTab === 'Skills' && (
            <div className="space-y-4">
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No skills identified yet. Upload your resume to extract technical competencies automatically.
                </div>
              )}
            </div>
          )}

          {activeTab === 'Projects' && (
            <div className="space-y-4">
              {projects.length > 0 ? (
                projects.map((proj, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                    {(proj.technologies?.length > 0 || proj.tech) && (
                      <div className="text-xs font-mono text-blue-600">
                        {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.tech || '')}
                      </div>
                    )}
                    <p className="text-xs text-slate-600">{proj.description}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No projects added yet. Upload your resume to extract your project portfolio.
                </div>
              )}
            </div>
          )}

          {activeTab === 'Certifications' && (
            <div className="space-y-4">
              {certifications.length > 0 ? (
                certifications.map((cert, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{cert.title || cert.name}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {cert.issuer ? `${cert.issuer} ` : ''}
                        {cert.year || cert.issueDate ? `• ${cert.year || cert.issueDate}` : ''}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No certifications recorded yet. Upload your resume to extract professional credentials.
                </div>
              )}
            </div>
          )}

          {activeTab === 'Languages' && (
            <div className="space-y-4">
              {languages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {languages.map((lang, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{lang}</h4>
                        <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                          Spoken Language
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No languages recorded yet. Upload your resume to extract spoken languages automatically.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
