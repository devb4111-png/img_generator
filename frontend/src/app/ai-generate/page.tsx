'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  generateAiImage,
  getFullApiUrl,
  GenerationResult,
} from '@/services/api';
import {
  Sparkles,
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  X,
  Wand2,
  Cpu,
  Layers,
  HelpCircle,
} from 'lucide-react';

const PROMPT_SUGGESTIONS = [
  'Futuristic sustainable solar energy campus with modern glass architecture and lush botanical gardens',
  'Next-generation AI data center with sleek holographic network flows and subtle blue illumination',
  'Eco-friendly corporate innovation summit atrium with natural morning sunlight and minimalist wood textures',
  'Global space exploration research facility overlooking a serene planetary horizon with soft ambient stars',
];

export default function AiGeneratePage() {
  // Form State
  const [creativeIdea, setCreativeIdea] = useState<string>('');
  const [organizationName, setOrganizationName] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  // Model & Styling Options
  const [size, setSize] = useState<'1024x1024' | '1792x1024' | '1024x1792'>('1024x1024');
  const [style, setStyle] = useState<'vivid' | 'natural'>('vivid');
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [brandingZone, setBrandingZone] = useState<'bottom' | 'top' | 'center'>('bottom');

  // Request & UI State
  const [generating, setGenerating] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [usePreviewFallback, setUsePreviewFallback] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Logo selection
  const handleFileChange = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'png' && ext !== 'svg') {
      setError('Please upload a valid PNG or SVG logo.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Logo size exceeds 5MB limit.');
      return;
    }

    setError(null);
    setLogoFile(file);
    const preview = URL.createObjectURL(file);
    setLogoPreviewUrl(preview);
  };

  const removeLogo = () => {
    setLogoFile(null);
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
      setLogoPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Submit AI Generation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!creativeIdea.trim() || creativeIdea.trim().length < 5) {
      setError('Please provide a creative concept of at least 5 characters.');
      return;
    }
    if (!organizationName.trim()) {
      setError('Please enter your authority or organization name.');
      return;
    }
    if (!logoFile) {
      setError('Please upload an organization logo (PNG or SVG format).');
      return;
    }

    setGenerating(true);
    setError(null);
    setResult(null);
    setProgressStep('Synthesizing photorealistic diffusion background via Free AI Studio (Zero-Cost / No Card)...');

    try {
      const formData = new FormData();
      formData.append('creativeIdea', creativeIdea.trim());
      formData.append('organizationName', organizationName.trim());
      formData.append('logo', logoFile);
      formData.append('size', size);
      formData.append('style', style);
      formData.append('quality', quality);
      formData.append('brandingZone', brandingZone);
      formData.append('allowFallback', usePreviewFallback ? 'true' : 'false');

      const genData = await generateAiImage(formData);
      setResult(genData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI generation failed.';
      setError(msg);
    } finally {
      setGenerating(false);
      setProgressStep('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Ambient background glows */}
      <div className="ambient-glow bg-purple-600 w-96 h-96 -top-10 -right-20" />
      <div className="ambient-glow bg-blue-600 w-80 h-80 top-1/2 -left-20" />

      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Overview</span>
        </Link>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
          100% Free AI Engine Active
        </span>
      </div>

      {/* Header */}
      <div className="mb-8 pb-6 border-b border-white/5 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Mode B: Free AI Diffusion Studio (Zero-Cost / No Paid Keys)</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          AI-Powered Image Generator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Synthesize custom photorealistic backgrounds via open-access AI Diffusion with authentic server-side logo compositing and crisp typography. Completely free, no billing or credit card required.
        </p>
      </div>

      {/* Error Alert / Action Card */}
      {error && (
        <div className="mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs relative z-10 space-y-3 shadow-lg backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-300 text-sm">
                  {error.includes('Agent Platform API is not enabled')
                    ? 'Action Required: Enable Agent Platform API in Google Cloud'
                    : 'Image Synthesis Error'}
                </h4>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-amber-400 hover:text-amber-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error.includes('https://console.developers.google.com') && (
            <div className="pt-3 border-t border-amber-500/20 flex flex-wrap items-center gap-3">
              <a
                href="https://console.developers.google.com/apis/api/aiplatform.googleapis.com/overview?project=859620796019"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all inline-flex items-center gap-2 shadow-md hover:scale-[1.02]"
              >
                <span>👉 Click Here to Enable API on Google Cloud Console</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setUsePreviewFallback(true);
                  setError(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-white/10 transition-colors"
              >
                ⚡ Switch to Executive Studio Backdrop (Offline Preview)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 space-y-6">
            {/* 1. Creative Concept Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-purple-400" />
                  <span>1. Creative Concept or Theme</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {creativeIdea.trim() ? creativeIdea.trim().split(/\s+/).length.toLocaleString() : 0} / 10,000 words ({creativeIdea.length.toLocaleString()} chars)
                </span>
              </div>
              <textarea
                value={creativeIdea}
                onChange={(e) => setCreativeIdea(e.target.value)}
                maxLength={60000}
                rows={6}
                placeholder="Describe your visual concept in detail (up to 10,000 words)... e.g., Futuristic renewable energy forum inside a luminous glass dome with natural morning light, photovoltaic solar arrays, and clean minimal architecture."
                className="w-full px-3.5 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-y min-h-[140px] leading-relaxed"
                required
              />

              {/* Suggestion Starter Chips */}
              <div className="mt-2.5 space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                  Quick Idea Inspiration:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCreativeIdea(item)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-white/5 hover:border-purple-500/30 text-slate-400 hover:text-slate-200 transition-colors text-left truncate max-w-full cursor-pointer"
                    >
                      💡 {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Brand Identity Inputs */}
            <div className="border-t border-white/5 pt-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-400" />
                <span>2. Brand Identity &amp; Overlay</span>
              </h3>

              {/* Organization Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Organization / Authority Name <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {organizationName.length}/120
                  </span>
                </div>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  maxLength={120}
                  placeholder="e.g. Team Connect Global Forum"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              {/* Logo Upload Zone */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Brand Logo (PNG or SVG) <span className="text-rose-400">*</span>
                </label>

                {!logoPreviewUrl ? (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl border border-dashed border-white/20 bg-slate-900/40 p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-500/50 hover:bg-slate-900/70 transition-all group"
                  >
                    <Upload className="h-7 w-7 text-slate-500 group-hover:text-purple-400 transition-colors mb-2" />
                    <span className="text-xs font-medium text-slate-300">
                      Click to select or drag &amp; drop logo
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      Accepts PNG or SVG (Max 5MB)
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.svg,image/png,image/svg+xml"
                      onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-11 w-11 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center p-1 shrink-0">
                        <img
                          src={logoPreviewUrl}
                          alt="Logo Preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-medium text-slate-200 truncate">
                          {logoFile?.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {logoFile ? (logoFile.size / 1024).toFixed(1) + ' KB' : ''} •{' '}
                          {logoFile?.type || 'Image'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeLogo}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Remove logo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Model & Output Settings */}
            <div className="border-t border-white/5 pt-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-400" />
                <span>3. Generation Parameters</span>
              </h3>

              {/* Aspect Ratio Cards */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Canvas Aspect Ratio &amp; Dimensions
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: '1024x1024', label: 'Square', dims: '1024 × 1024', icon: '1:1' },
                    { id: '1792x1024', label: 'Landscape', dims: '1792 × 1024', icon: '16:9' },
                    { id: '1024x1792', label: 'Portrait', dims: '1024 × 1792', icon: '9:16' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSize(item.id as typeof size)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        size === item.id
                          ? 'bg-purple-600/15 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500'
                          : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold block text-purple-400">
                        {item.icon}
                      </span>
                      <span className="text-xs font-semibold block text-slate-200 mt-0.5">
                        {item.label}
                      </span>
                      <span className="text-[9px] text-slate-500 block">{item.dims}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style, Quality & Branding Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Visual Style */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Visual Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as typeof style)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="vivid">Vivid (Hyper-real, rich)</option>
                    <option value="natural">Natural (Organic, diffuse)</option>
                  </select>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Rendering Quality
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as typeof quality)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="standard">Standard Quality</option>
                    <option value="hd">HD Resolution</option>
                  </select>
                </div>

                {/* Branding Zone */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Branding Negative Space
                  </label>
                  <select
                    value={brandingZone}
                    onChange={(e) => setBrandingZone(e.target.value as typeof brandingZone)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="bottom">Bottom Third Zone</option>
                    <option value="top">Top Third Zone</option>
                    <option value="center">Centered Framing</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={generating || !creativeIdea.trim() || !organizationName.trim() || !logoFile}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Synthesizing Background &amp; Compositing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate AI Branded Image</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Execution Status & Result Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Progress / Step indicator while generating */}
          {generating && (
            <div className="glass-panel rounded-2xl p-6 border-purple-500/30 animate-pulse space-y-3">
              <div className="flex items-center gap-2.5 text-purple-400 text-xs font-semibold">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>AI Pipeline in Progress</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {progressStep || 'Synthesizing background and overlaying authentic brand mark...'}
              </p>
              <div className="space-y-1.5 pt-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Structured prompt constructed deterministically</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>OpenAI Image Generation API executing...</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="h-3.5 w-3.5 rounded-full border border-slate-600" />
                  <span>Sharp multi-layer compositing queued</span>
                </div>
              </div>
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="glass-panel rounded-2xl p-6 border-emerald-500/30 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>AI Generation Complete</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {result.width} × {result.height}
                </span>
              </div>

              {/* Rendered Preview */}
              <div className="rounded-xl overflow-hidden bg-slate-950 border border-white/10 relative">
                <img
                  src={getFullApiUrl(result.previewUrl)}
                  alt="Generated AI Composite"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Structured Metadata */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-400 text-[11px]">Authority:</span>
                  <span className="font-semibold text-white text-right">{result.organizationName}</span>
                </div>

                {result.originalCreativeIdea && (
                  <div className="rounded-lg bg-slate-900/60 p-2.5 border border-white/5 text-[11px] text-slate-300">
                    <span className="text-slate-500 block text-[10px] font-semibold uppercase">Concept:</span>
                    <span className="line-clamp-2">{result.originalCreativeIdea}</span>
                  </div>
                )}
              </div>

              {/* Download Action */}
              <a
                href={getFullApiUrl(result.downloadUrl)}
                download
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Composite PNG</span>
              </a>
            </div>
          )}

          {/* Architecture info card */}
          {!result && !generating && (
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <HelpCircle className="h-4 w-4 text-purple-400" />
                <span>How Mode B AI Generation Works</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-200">Deterministic Prompt Compiler:</strong> Converts your core concept into a structured prompt covering subject, style, lighting, and explicit negative space.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-200">Zero Logo Hallucination:</strong> Instructs the AI model strictly to synthesize the background scenery without text or watermarks.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-200">Server-Side Sharp Compositing:</strong> Overlays your authentic PNG/SVG logo and organization typography with exact alignment.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
