import React from 'react';
import { 
  Activity, 
  Download, 
  RefreshCw, 
  ChevronDown,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onExportData: (format: 'json' | 'csv') => void;
  hasData: boolean;
  isScraping: boolean;
  onRefreshScrape?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExportData,
  hasData,
  isScraping,
  onRefreshScrape
}) => {
  return (
    <header className="relative w-full border-b border-slate-800/90 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white sticky top-0 z-30 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.4)] overflow-hidden font-sans">
      
      {/* Biomedical Clinical Research Network Pattern Background on Top-Right */}
      <div className="absolute top-0 right-0 w-80 sm:w-[500px] h-full pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <svg 
          className="absolute -top-3 -right-4 w-full h-full opacity-20 text-sky-400"
          viewBox="0 0 450 130" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="header-net-fade" cx="100%" cy="0%" r="90%">
              <stop offset="0%" stopColor="white" stopOpacity="0.9" />
              <stop offset="65%" stopColor="white" stopOpacity="0.25" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="header-net-mask">
              <rect width="450" height="130" fill="url(#header-net-fade)" />
            </mask>
          </defs>
          <g mask="url(#header-net-mask)" stroke="currentColor" strokeWidth="0.9">
            <line x1="430" y1="18" x2="370" y2="52" />
            <line x1="370" y1="52" x2="310" y2="30" />
            <line x1="370" y1="52" x2="395" y2="105" />
            <line x1="310" y1="30" x2="240" y2="70" />
            <line x1="240" y1="70" x2="285" y2="110" />
            <line x1="285" y1="110" x2="395" y2="105" />
            <line x1="240" y1="70" x2="170" y2="45" />
            <line x1="170" y1="45" x2="135" y2="98" />
            <line x1="135" y1="98" x2="215" y2="120" />
            <line x1="215" y1="120" x2="285" y2="110" />
            <line x1="170" y1="45" x2="90" y2="60" />

            {/* Glowing Network Nodes */}
            <circle cx="430" cy="18" r="3.5" fill="currentColor" />
            <circle cx="370" cy="52" r="4" fill="currentColor" />
            <circle cx="310" cy="30" r="3" fill="currentColor" />
            <circle cx="395" cy="105" r="3.5" fill="currentColor" />
            <circle cx="240" cy="70" r="4.5" fill="currentColor" />
            <circle cx="285" cy="110" r="3" fill="currentColor" />
            <circle cx="170" cy="45" r="3.5" fill="currentColor" />
            <circle cx="135" cy="98" r="3" fill="currentColor" />
            <circle cx="215" cy="120" r="3.5" fill="currentColor" />
            <circle cx="90" cy="60" r="2.5" fill="currentColor" />
          </g>
        </svg>
      </div>

      {/* Main Top Strip Content Container - Aligned with 7xl grid below */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 sm:py-4 gap-3">
          
          {/* Prominent Full-Strip LumiDex Brand Unit */}
          <div className="flex items-center space-x-3.5">
            {/* Clinical Emblem */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/35 via-blue-700/25 to-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-300 shadow-inner shrink-0 group">
              <Activity className="w-5 h-5 text-sky-300 group-hover:scale-110 transition-transform duration-200" />
            </div>

            {/* Brand Title, Description & Repositories Tag */}
            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  LumiDex
                </h1>
                <span className="text-xs sm:text-sm font-semibold text-slate-200 tracking-tight">
                  Healthcare Research & Clinical Intelligence Tool
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-[11px] text-slate-400 font-mono tracking-wider flex items-center space-x-1.5">
                  <span>NCBI PubMed</span>
                  <span className="text-slate-600">·</span>
                  <span>ClinicalTrials.gov</span>
                  <span className="text-slate-600">·</span>
                  <span>Europe PMC</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Controls: Aligned to 7xl Grid Right Edge */}
          <div className="flex items-center space-x-2.5 self-end sm:self-center shrink-0">
            {/* Refresh / Re-query Action */}
            {onRefreshScrape && hasData && (
              <button
                onClick={onRefreshScrape}
                disabled={isScraping}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all shadow-sm cursor-pointer disabled:opacity-50"
                title="Refresh clinical repositories now"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isScraping ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            )}

            {/* Export Dataset Dropdown */}
            {hasData && (
              <div className="relative group">
                <button
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
                  title="Export scraped clinical records"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Export Records</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-150" />
                </button>
                <div className="absolute right-0 mt-1.5 w-48 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-xl shadow-xl py-1 hidden group-hover:block z-50 animate-in fade-in duration-100">
                  <button
                    onClick={() => onExportData('json')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 font-mono transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>JSON Dataset</span>
                    <span className="text-[10px] text-slate-400">Structured</span>
                  </button>
                  <button
                    onClick={() => onExportData('csv')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 font-mono transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>CSV Spreadsheet</span>
                    <span className="text-[10px] text-slate-400">Trials & Studies</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
