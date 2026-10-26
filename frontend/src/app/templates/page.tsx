'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  fetchTemplates,
  generateTemplateImage,
  getFullApiUrl,
  TemplateItem,
  GenerationResult,
} from '@/services/api';
import {
  LayoutTemplate,
  ArrowLeft,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  X,
  FileImage,
  Sliders,
  Layers,
} from 'lucide-react';

export default function TemplatesPage() {
  // State
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [organizationName, setOrganizationName] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load templates from backend
  const loadTemplates = async () => {
    setLoadingTemplates(true);
    setError(null);
    try {
      const data = await fetchTemplates();
      setTemplates(data);
      if (data.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(data[0].id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve templates';
      setError(msg);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Handle Logo selection
  const handleFileChange = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'png' && ext !== 'svg') {
      setError('Please select a valid PNG or SVG logo.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Logo size exceeds 5MB limit.');
      return;
    }

    setError(null);
    setLogoFile(file);

    // Create object URL for preview
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

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Submit Generation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) {
      setError('Please select a template.');
      return;
    }
    if (!organizationName.trim()) {
      setError('Please enter your organization or authority name.');
      return;
    }
    if (!logoFile) {
      setError('Please upload an organization logo (PNG or SVG).');
      return;
    }

    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('templateId', selectedTemplateId);
      formData.append('organizationName', organizationName.trim());
      formData.append('logo', logoFile);

      const genData = await generateTemplateImage(formData);
      setResult(genData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image generation failed.';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button & Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Overview</span>
        </Link>
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
          Phase 2 Active
        </span>
      </div>

      {/* Header */}
      <div className="mb-8 pb-6 border-b border-white/5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-2">
          <LayoutTemplate className="h-3.5 w-3.5" />
          <span>Mode A Studio</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Template-Based Image Generator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Select a template, customize authority details, upload your brand mark, and produce high-resolution composite images.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Template Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-400" />
                <span>1. Select Background Template</span>
              </h2>
              <button
                onClick={loadTemplates}
                disabled={loadingTemplates}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${loadingTemplates ? 'animate-spin text-blue-400' : ''}`} />
                <span>Reload</span>
              </button>
            </div>

            {loadingTemplates ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-400 mb-2" />
                <span>Loading available templates from backend...</span>
              </div>
            ) : templates.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No templates currently available. Check backend server connection.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  const previewFullUrl = getFullApiUrl(tpl.previewUrl);

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`group relative rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500'
                          : 'bg-slate-900/40 border-white/5 hover:border-white/20 hover:bg-slate-900/70'
                      }`}
                    >
                      {/* Check badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white z-10 shadow-sm">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                      )}

                      {/* Image Preview */}
                      <div className="h-32 w-full rounded-lg overflow-hidden bg-slate-950 mb-3 relative flex items-center justify-center border border-white/5">
                        <img
                          src={previewFullUrl}
                          alt={tpl.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-white">{tpl.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                          {tpl.width}×{tpl.height}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{tpl.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Template Placement Spec preview card */}
          {selectedTemplate && (
            <div className="glass-panel rounded-2xl p-6 text-xs text-slate-400">
              <div className="flex items-center gap-2 font-semibold text-slate-200 mb-3">
                <Sliders className="h-4 w-4 text-indigo-400" />
                <span>Active Template Configuration: {selectedTemplate.name}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                  <span className="text-slate-500 block text-[10px]">CANVAS</span>
                  <span className="text-slate-200">{selectedTemplate.width} × {selectedTemplate.height} px</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                  <span className="text-slate-500 block text-[10px]">LOGO BOUNDS</span>
                  <span className="text-slate-200">
                    {Math.round(selectedTemplate.placements.logo.width * selectedTemplate.width)} × {Math.round(selectedTemplate.placements.logo.height * selectedTemplate.height)} px
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                  <span className="text-slate-500 block text-[10px]">FONT SIZE</span>
                  <span className="text-slate-200">{selectedTemplate.placements.organizationName.fontSize} px</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                  <span className="text-slate-500 block text-[10px]">ALIGNMENT</span>
                  <span className="text-slate-200 capitalize">{selectedTemplate.placements.organizationName.textAlign}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Generation Form & Result (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Customization Form */}
          <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Upload className="h-4 w-4 text-purple-400" />
              <span>2. Branding & Assets</span>
            </h2>

            {/* Authority Name */}
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
                placeholder="e.g. Team Connect Global Authority"
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
                  className="rounded-xl border border-dashed border-white/20 bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500/50 hover:bg-slate-900/70 transition-all group"
                >
                  <Upload className="h-8 w-8 text-slate-500 group-hover:text-blue-400 transition-colors mb-2" />
                  <span className="text-xs font-medium text-slate-300">
                    Click to select or drag & drop logo
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
                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-12 w-12 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center p-1.5 shrink-0">
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={generating || !selectedTemplateId || !organizationName.trim() || !logoFile}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Compositing Image via Sharp...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Branded PNG</span>
                </>
              )}
            </button>
          </form>

          {/* Generated Result Preview Card */}
          {result && (
            <div className="glass-panel rounded-2xl p-6 border-emerald-500/30 animate-fade-in space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Image Generated Successfully</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {result.width}×{result.height}
                </span>
              </div>

              {/* Final Composite Preview */}
              <div className="rounded-xl overflow-hidden bg-slate-950 border border-white/10 relative">
                <img
                  src={getFullApiUrl(result.previewUrl)}
                  alt="Generated Composite"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Metadata & Actions */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Authority:</span>
                  <span className="font-semibold text-white">{result.organizationName}</span>
                </div>

                <a
                  href={getFullApiUrl(result.downloadUrl)}
                  download
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Composite PNG</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
