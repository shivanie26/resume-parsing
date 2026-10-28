import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, Award, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>About HireSmart</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Pioneering Fair & Competency-First Recruitment
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          HireSmart was built to solve the fundamental flaws of legacy applicant tracking systems:
          manual screening fatigue, keyword manipulation, unverified candidate claims, and unconscious demographic bias.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Our Mission</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            To provide transparent, explainable, and merit-based hiring technology where candidates prove actual technical capabilities through standardized assessments.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Demographic Neutrality</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            By assigning anonymous Candidate IDs and hiding personal identity markers during initial screening, recruiters evaluate purely on job qualifications.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Explainable AI</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every candidate ranking score is backed by a deterministic, mathematically verifiable formula: 40% Skill Match + 40% Exam Score + 20% Experience.
          </p>
        </div>
      </div>

      {/* Technology Stack Info */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Technical Foundation</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          HireSmart is built using a modern full-stack architecture: React, Vite, and Tailwind CSS on the frontend; Node.js, Express.js, and MongoDB Atlas on the backend; PDF/DOCX natural language text processing engines; and server-side MCQ test evaluation.
        </p>
        <div className="pt-2 flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1 bg-slate-100 rounded-lg font-semibold text-slate-700">React + Vite</span>
          <span className="px-3 py-1 bg-slate-100 rounded-lg font-semibold text-slate-700">Tailwind CSS</span>
          <span className="px-3 py-1 bg-slate-100 rounded-lg font-semibold text-slate-700">Node.js & Express</span>
          <span className="px-3 py-1 bg-slate-100 rounded-lg font-semibold text-slate-700">MongoDB Atlas</span>
          <span className="px-3 py-1 bg-slate-100 rounded-lg font-semibold text-slate-700">JWT & bcrypt</span>
        </div>
      </div>
    </div>
  );
}
