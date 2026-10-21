import React, { useState } from 'react';
import { 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  Search, 
  Building2, 
  ShieldAlert, 
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';
import { HealthcareDataset } from '../types';

interface DatasetsViewProps {
  datasets: HealthcareDataset[];
  therapeuticArea: string;
}

export const DatasetsView: React.FC<DatasetsViewProps> = ({ datasets, therapeuticArea }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = datasets.filter((d) => {
    const text = `${d.name} ${d.provider} ${d.scope} ${d.clinical_use} ${d.commercial_use}`.toLowerCase();
    return !searchQuery.trim() || text.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Search & Overview Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Database className="w-4 h-4 text-purple-600" />
            <span>Public Healthcare & Commercial Datasets Catalog</span>
          </h3>
          <p className="text-xs text-slate-500">
            Authoritative public repositories for Real-World Evidence (RWE), epidemiology, and market sizing
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search datasets, providers, variables..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 rounded-lg text-slate-800"
          />
        </div>
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((dataset) => (
          <div
            key={dataset.id}
            className="bg-white rounded-xl border border-slate-200 hover:border-purple-200 shadow-2xs hover:shadow-xs transition-all duration-150 p-5 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[11px] font-semibold text-purple-700 tracking-wider uppercase">
                    {dataset.provider}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {dataset.name}
                  </h4>
                </div>
                <a
                  href={dataset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-purple-600 hover:text-purple-800 transition-colors shrink-0"
                  title="Visit Official Data Repository"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Scope & Record count */}
              <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                  {dataset.records}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-medium">
                  {dataset.access}
                </span>
              </div>

              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                <strong>Scope:</strong> {dataset.scope}
              </p>

              {/* Dual Use Cases */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                  <span className="font-semibold text-blue-900 block mb-0.5">Clinical & Research Application:</span>
                  <p className="text-slate-700 text-[11px] leading-relaxed">{dataset.clinical_use}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-100">
                  <span className="font-semibold text-teal-900 block mb-0.5">Commercial & Market Valuation Leverage:</span>
                  <p className="text-slate-700 text-[11px] leading-relaxed">{dataset.commercial_use}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Domain: {dataset.therapeutic_areas.join(', ')}</span>
              <a
                href={dataset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center space-x-1"
              >
                <span>Access Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
