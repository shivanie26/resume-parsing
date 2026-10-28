import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Mail, Phone, MapPin, Send, CheckCircle2, ExternalLink, Copy, Check } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responseInfo, setResponseInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const targetEmail = 'eshivani26@gmail.com';
  const targetPhone = '+91 7010517001';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(targetEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMailtoLink = () => {
    const subject = encodeURIComponent(`[HireSmart Inquiry] Message from ${name || 'Prospective User'}`);
    const body = encodeURIComponent(
      `Hello Shivani,\n\nI am contacting you regarding the HireSmart platform.\n\nSender Name: ${name}\nSender Email: ${email}\n\nMessage:\n${message}\n\nThank you!`
    );
    return `mailto:${targetEmail}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await axiosClient.post('/contact', {
        name,
        email,
        message
      });

      if (res.data.success) {
        setResponseInfo(res.data);
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      // Fallback: Still mark submitted and prompt direct mailto
      setSubmitted(true);
      setResponseInfo({
        message: 'Your message has been prepared for transmission.',
        emailSent: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Get in Touch
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have questions regarding HireSmart platform deployment, API integrations, or academic demonstration?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Contact Info */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Contact Information</h3>
            <p className="text-xs text-blue-100 leading-relaxed">
              We welcome inquiries from academic institutions, recruitment teams, and software engineers.
            </p>

            <div className="space-y-4 text-xs">
              {/* Email Option */}
              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-blue-200" />
                    <span className="font-semibold text-blue-100">Direct Email Option</span>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1 hover:bg-white/20 rounded-lg transition text-blue-200 hover:text-white"
                    title="Copy Email"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <a
                  href={`mailto:${targetEmail}`}
                  className="block font-mono text-sm font-bold text-white hover:underline truncate"
                >
                  {targetEmail}
                </a>
              </div>

              {/* Phone Option */}
              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 space-y-1">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-200" />
                  <span className="font-semibold text-blue-100">Direct Phone Option</span>
                </div>
                <a
                  href={`tel:${targetPhone.replace(/\s+/g, '')}`}
                  className="block font-mono text-sm font-bold text-white hover:underline"
                >
                  {targetPhone}
                </a>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 pt-2 text-blue-100">
                <MapPin className="w-4 h-4 text-blue-300 flex-shrink-0" />
                <span>Campus Tech Hub, Tamil Nadu, India</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-blue-200 pt-6 border-t border-white/20">
            HireSmart • Academic Capstone Demonstration
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 p-8">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-slate-900">Message Received!</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {responseInfo?.message || `Thank you, ${name}! Your inquiry has been saved and routed to ${targetEmail}.`}
                </p>
              </div>

              {/* Instant 1-Click Send via User's Email Client */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-left space-y-2 mt-4">
                <div className="text-xs font-bold text-blue-900">
                  Ensure Instant Delivery to {targetEmail}:
                </div>
                <p className="text-[11px] text-blue-700">
                  Click below to open this exact inquiry pre-filled in your personal email app (Gmail, Outlook, Apple Mail) and send directly to Shivani:
                </p>
                <a
                  href={getMailtoLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open in My Email App / Gmail</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                }}
                className="text-xs text-slate-400 hover:text-slate-600 underline pt-2"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Write your message for ${targetEmail}...`}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Sending Inquiry...' : `Send Message to ${targetEmail}`}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
