'use client';

import React from 'react';
import { Layers, ShieldCheck, Zap, Cpu } from 'lucide-react';

export default function Footer() {
  const phases = [
    { num: '1', title: 'Setup & Foundation', status: 'Completed' },
    { num: '2', title: 'Template Generation', status: 'Completed' },
    { num: '3', title: 'Free AI Diffusion Studio', status: 'Completed' },
    { num: '4', title: 'Security & Verification', status: 'Completed' },
  ];

  return (
    <footer className="mt-auto border-t border-white/5 bg-[#070a12]/90 backdrop-blur-md py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-white/5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center">
                <Layers className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-base">Team Connect</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Multi-mode image generation engine designed with a strictly decoupled architecture.
              Separate Next.js frontend with Tailwind CSS and an Express TypeScript backend with Sharp and MongoDB.
            </p>
            <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Decoupled Security
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400" /> Sharp Processing
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-indigo-400" /> OpenAI Ready
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Phase Progression
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {phases.map((p) => (
                <div
                  key={p.num}
                  className={`p-2.5 rounded-xl border text-xs ${
                    p.status.includes('Active')
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                      : 'bg-slate-900/40 border-white/5 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] font-mono text-indigo-400 font-semibold">
                    PHASE {p.num}
                  </div>
                  <div className="font-medium text-slate-200 mt-0.5 truncate">{p.title}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{p.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2025 Team Connect Multi-Mode Image Generator. Built with Next.js, Express &amp; TypeScript.</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-slate-400">REST API: Port 5000</span>
            <span className="font-mono text-[11px] text-slate-400">Frontend: Port 3000</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
