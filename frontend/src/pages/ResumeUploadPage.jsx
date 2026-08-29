import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

const ResumeUploadPage = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (files) => {
    const valid = Array.from(files).filter(file => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      return ext === '.pdf' || ext === '.docx' || ext === '.doc';
    });

    if (valid.length === 0) {
      setError('Please select valid PDF or DOCX resume documents.');
      return;
    }
    setError('');
    setSelectedFiles(valid);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Please choose at least one resume document to process.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('resumes', file);
    });

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success && res.data.resumes.length > 0) {
        const firstResumeId = res.data.resumes[0]._id;
        // Redirect to Parsed Result inspector
        navigate(`/resume-parsed/${firstResumeId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing uploaded resume file(s).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="glass-card p-8 rounded-2xl border-slate-200 shadow-xl space-y-6">
        
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-3 shadow-inner">
            <Upload className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Upload Resume Documents</h1>
          <p className="text-slate-500 text-sm mt-1">Upload PDF or DOCX files for automated NLP text extraction and competency analysis.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-xl font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-6">
          
          {/* Drag & Drop Box */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragActive 
                ? 'border-brand-500 bg-brand-50/50 scale-[1.01]' 
                : 'border-slate-300 hover:border-brand-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.doc"
              onChange={(e) => handleFileChange(e.target.files)}
              className="hidden"
              id="resume-file-input"
            />
            <label htmlFor="resume-file-input" className="cursor-pointer block">
              <FileText className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <span className="font-bold text-slate-800 text-base block">Drag & Drop resumes here</span>
              <span className="text-xs text-slate-500 block mt-1">or click to browse from your computer</span>
              <span className="inline-block mt-3 px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-semibold text-slate-600 shadow-xs">
                Supports PDF & DOCX (Max 10MB per file)
              </span>
            </label>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Selected Files ({selectedFiles.length})
              </div>
              <div className="space-y-1.5">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs font-medium">
                    <span className="truncate text-slate-800 font-semibold">{file.name}</span>
                    <span className="text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || selectedFiles.length === 0}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" /> Extracting NLP Skills & Structuring JSON...
              </span>
            ) : (
              <>Process & Extract Resume Data</>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ResumeUploadPage;
