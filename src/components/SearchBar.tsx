import React, { useState } from 'react';
import { 
  Search, 
  Loader2, 
  Play, 
  SlidersHorizontal, 
  BookOpen, 
  Database, 
  FlaskConical, 
  Globe, 
  X
} from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: (customQuery?: string) => void;
  isLoading: boolean;
  source: string;
  onSourceChange: (s: string) => void;
  limit: number;
  onLimitChange: (l: number) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  onSearch,
  isLoading,
  source,
  onSourceChange,
  limit,
  onLimitChange
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    onQueryChange('');
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border-b border-slate-200/80 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Single Universal Search Box */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Search className="w-4 h-4 text-blue-600" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search any therapeutic area, disease, molecule, or product (e.g., GLP-1, Trastuzumab deruxtecan, Alzheimer's, CAR-T)..."
              className="w-full pl-10 pr-9 py-2.5 bg-white/95 border border-slate-200/90 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-normal transition-all shadow-[0_1px_6px_-1px_rgba(148,163,184,0.12)]"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs ${
                showFilters
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200/90 bg-white/90 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Repositories</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Querying Repositories...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Search Research</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Collapsible Source Controls */}
        {showFilters && (
          <div className="p-3 bg-white/95 border border-slate-200/90 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animate-in fade-in duration-150 shadow-2xs">
            <div>
              <span className="font-semibold text-slate-700 block mb-1.5 text-[11px] uppercase tracking-wider">Public Repositories Searched:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Sources (PubMed + CT.gov + Europe PMC)', icon: Globe },
                  { id: 'pubmed', label: 'PubMed / NCBI', icon: BookOpen },
                  { id: 'clinicaltrials', label: 'ClinicalTrials.gov', icon: FlaskConical },
                  { id: 'europepmc', label: 'Europe PMC & Preprints', icon: Database },
                ].map((s) => {
                  const Icon = s.icon;
                  const isChecked = source === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onSourceChange(s.id)}
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-700 block mb-1.5 text-[11px] uppercase tracking-wider">Depth per Repository:</span>
              <div className="flex items-center space-x-2">
                {[4, 8, 12, 16].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onLimitChange(l)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer ${
                      limit === l
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    {l} records
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
