import React from 'react';
import Link from 'next/link';
import BackendHealthStatus from '@/components/BackendHealthStatus';
import {
  LayoutTemplate,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  FileCheck,
  Zap,
  Code2,
  Database,
  Cpu,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow bg-blue-600 w-96 h-96 -top-20 -left-20" />
      <div className="ambient-glow bg-purple-600 w-[500px] h-[500px] top-1/3 -right-32" />
      <div className="ambient-glow bg-indigo-600 w-80 h-80 bottom-10 left-1/4" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400 mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Team Connect Image Generator • Phase 4 Production Ready</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Multi-Mode Image Generation{' '}
            <span className="gradient-text-primary">Engine</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
            Create high-impact branded visual assets with two distinct generation workflows.
            Choose between curated background templates or AI-synthesized imagery, with 
            server-side logo compositing and typography rendering.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <LayoutTemplate className="h-4 w-4" />
              <span>Mode A: Templates</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/ai-generate"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-sm border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Mode B: AI Studio</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Live System Health & Backend Verification */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              System Connectivity & Verification
            </h2>
            <span className="text-[11px] text-slate-500">Live Health Check</span>
          </div>
          <BackendHealthStatus />
        </div>

        {/* The Two Workflows (Cards) */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Two Workflows. Total Creative Flexibility.
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Select the generation pathway tailored to your team&apos;s requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mode A Card */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -z-10 group-hover:bg-blue-500/20 transition-all" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <LayoutTemplate className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Mode A
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">
                  Template-Based Generation
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Select from a gallery of professionally designed background templates.
                  Upload your organization logo (PNG or SVG) and organization name to receive
                  an automatically composited, pixel-perfect PNG image.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <FileCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Predefined background template gallery with metadata presets</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <FileCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>PNG and SVG logo upload with client-side preview & server validation</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <FileCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Precise Sharp compositing with normalized coordinate system</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <FileCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Instant downloadable PNG output with generation metadata logged</span>
                  </div>
                </div>
              </div>

              <Link
                href="/templates"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-medium text-sm transition-all group-hover:border-blue-500/60"
              >
                <span>Launch Template Workflow</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Mode B Card */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -z-10 group-hover:bg-purple-500/20 transition-all" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Mode B
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">
                  AI-Powered Generation
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Describe your creative concept in plain English. The backend compiles a structured
                  generative prompt, synthesizes a background via OpenAI DALL-E, and cleanly overlays
                  your authentic logo and organization name.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Zap className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Deterministic prompt compiler focusing purely on visual scenery</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Zap className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>OpenAI Image API integration with protected backend API keys</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Zap className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Zero AI text hallucination: logo and text overlaid using Sharp</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Zap className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Full metadata tracking: prompt, seed idea, and output in MongoDB</span>
                  </div>
                </div>
              </div>

              <Link
                href="/ai-generate"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-medium text-sm transition-all group-hover:border-purple-500/60"
              >
                <span>Launch AI Generation Workflow</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Architecture Specs */}
        <div className="glass-panel rounded-2xl p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <Code2 className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">System Architecture & Core Rules</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-2">
                <Layers className="h-4 w-4" /> Next.js Frontend
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                App Router, React 19, TypeScript, and Tailwind CSS. Exclusively communicates with Express via HTTP APIs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold mb-2">
                <Cpu className="h-4 w-4" /> Express.js Backend
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Node.js, TypeScript, REST architecture with CORS, centralized error handling, and health probes.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-2">
                <Database className="h-4 w-4" /> MongoDB Database
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mongoose ORM for persistence of template coordinates and image generation records.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-2">
                <Shield className="h-4 w-4" /> Security Sandboxing
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                No secrets exposed to the client. File type/size checks, Sharp image processing, and isolated storage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
