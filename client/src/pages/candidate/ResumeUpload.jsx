import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Edit,
  Sparkles,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Award
} from 'lucide-react';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [resumeId, setResumeId] = useState(null);

  useEffect(() => {
    // Load latest parsed resume if one has actually been uploaded
    const fetchLatestResume = async () => {
      try {
        const res = await axiosClient.get('/candidates/me');
        if (res.data.success && res.data.latestResume) {
          setResumeId(res.data.latestResume._id);
          if (res.data.latestResume.parsedData) {
            setExtractedData(res.data.latestResume.parsedData);
          }
        }
      } catch (err) {
        console.error('Error fetching resume info:', err);
      }
    };
    fetchLatestResume();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      setError('Invalid file format. Only PDF (.pdf) and Word (.docx) documents are accepted.');
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit. Please upload a smaller document.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!file) {
      setError('Please select a PDF or DOCX file to upload.');
      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await axiosClient.post('/resumes/upload', formData);

      if (res.data.resume) {
        setResumeId(res.data.resume._id);
        const parsed = res.data.resume.parsedData || {};
        setExtractedData(parsed);

        if (res.data.warning) {
          setSuccess(res.data.warning);
        } else {
          setSuccess('Resume uploaded and parsed successfully!');
        }
      } else if (res.data.message) {
        setError(res.data.message);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || err.message || 'Resume upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Helper formatting functions
  const formatEducation = (edu) => {
    if (!edu) return 'Not Detected';
    if (Array.isArray(edu)) {
      if (edu.length === 0) return 'Not Detected';
      return edu.map(e => e.degree || e.institution || e).filter(Boolean).join(' • ');
    }
    return String(edu);
  };

  const formatExperience = (exp) => {
    if (!exp) return 'Not Detected';
    if (Array.isArray(exp)) {
      if (exp.length === 0) return 'Not Detected';
      return exp.map(e => e.title ? `${e.title}${e.company ? ' at ' + e.company : ''}` : e).join(', ');
    }
    return String(exp);
  };

  const formatProjects = (proj) => {
    if (!proj) return 'Not Detected';
    if (Array.isArray(proj)) {
      if (proj.length === 0) return 'Not Detected';
      return proj.map(p => p.title || p).join(', ');
    }
    return String(proj);
  };

  const formatCertifications = (certs) => {
    if (!certs) return 'Not Detected';
    if (Array.isArray(certs)) {
      if (certs.length === 0) return 'Not Detected';
      return certs.map(c => c.title || c).join(', ');
    }
    return String(certs);
  };

  return (
    <div className="space-y-6">
      {/* Screen 6 Top Card: Upload Your Resume */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Upload Your Resume
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload a PDF or DOCX file (Max 5MB)
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Drag and drop upload zone */}
        <form onSubmit={handleUpload}>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
              dragActive
                ? 'border-blue-600 bg-blue-50/50'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>

            <p className="text-sm font-semibold text-slate-800">
              Drag and drop your resume here
            </p>
            <p className="text-xs text-slate-400 mt-1">or</p>

            <div className="mt-3">
              <label
                htmlFor="resume-input"
                className="inline-block px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer shadow-sm transition"
              >
                Choose File
              </label>
              <input
                id="resume-input"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <p className="text-[11px] text-slate-400 mt-3">
              Supports PDF, DOCX (Max 5MB)
            </p>

            {file && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg text-xs font-medium border border-blue-200">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </div>

          {file && (
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>Extracting & Parsing Resume...</span>
                  </>
                ) : (
                  <span>Upload & Parse Resume</span>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Screen 6 Bottom Card: Extracted Information */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Extracted Information
          </h3>
          {resumeId && (
            <Link
              to={`/candidate/resume-review?id=${resumeId}`}
              className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>
          )}
        </div>

        {extractedData?.isImagePdf && (
          <div className="mb-6 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                <strong>OCR Engine Active:</strong> Successfully extracted text, skills, and credentials directly from graphic/scanned layout.
              </span>
            </div>
            {resumeId && (
              <Link
                to={`/candidate/resume-review?id=${resumeId}`}
                className="font-bold underline text-blue-700 hover:text-blue-800 ml-3 whitespace-nowrap"
              >
                Review & Edit
              </Link>
            )}
          </div>
        )}

        {extractedData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Name</span>
              <div className="text-sm font-bold text-slate-800">
                {extractedData.name || 'Not Detected'}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Email</span>
              <div className="text-sm font-bold text-slate-800">
                {extractedData.email || 'Not Detected'}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Phone</span>
              <div className="text-sm font-bold text-slate-800">
                {extractedData.phone || 'Not Detected'}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Skills</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {extractedData.skills && extractedData.skills.length > 0 ? (
                  extractedData.skills.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Not Detected</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Education</span>
              <div className="text-sm font-bold text-slate-800">
                {formatEducation(extractedData.education)}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Experience</span>
              <div className="text-sm font-bold text-slate-800">
                {formatExperience(extractedData.experience)}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Projects</span>
              <div className="text-sm font-bold text-slate-800">
                {formatProjects(extractedData.projects)}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Certifications</span>
              <div className="text-sm font-bold text-slate-800">
                {formatCertifications(extractedData.certifications)}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Resume Uploaded Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Upload your PDF or DOCX resume above. Our NLP parsing engine will automatically extract and display your verified competencies here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
