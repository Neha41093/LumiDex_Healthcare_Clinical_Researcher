import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  Copy, 
  Check, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Search,
  Award,
  Layers,
  FileText
} from 'lucide-react';
import { PubMedStudy, EuropePMCStudy } from '../types';

interface VerifiedStudiesViewProps {
  pubmedStudies: PubMedStudy[];
  europePmcStudies: EuropePMCStudy[];
  onOpenDetailModal: (study: any) => void;
}

export const VerifiedStudiesView: React.FC<VerifiedStudiesViewProps> = ({
  pubmedStudies,
  europePmcStudies,
  onOpenDetailModal
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Combine studies
  const allStudies = [
    ...pubmedStudies.map((s) => ({ ...s, repo: 'PubMed', display_date: s.pub_date })),
    ...europePmcStudies.map((s) => ({
      ...s,
      repo: s.source_type.includes('Preprint') ? 'Preprint (bioRxiv/medRxiv)' : 'Europe PMC',
      total_domain_hits: 0,
      mesh_terms: [] as string[],
      display_date: s.pub_year
    }))
  ];

  const filtered = allStudies.filter((study) => {
    const matchesLevel =
      filterLevel === 'all' ||
      (study.evidence_hierarchy?.level || '').toLowerCase().includes(filterLevel.toLowerCase());

    const textToMatch = `${study.title} ${study.authors} ${study.journal} ${study.abstract || ''}`.toLowerCase();
    const matchesSearch = !searchQuery.trim() || textToMatch.includes(searchQuery.toLowerCase());

    return matchesLevel && matchesSearch;
  });

  const handleCopyCitation = (study: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const citation = `${study.authors} (${study.pub_date || study.pub_year || 'Recent'}). ${study.title}. ${study.journal}.${study.doi ? ' DOI: ' + study.doi : ''}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(study.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getEvidenceBadgeClass = (level: string) => {
    if (level.includes('1')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    } else if (level.includes('2')) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    } else if (level.includes('3')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    } else {
      return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter verified studies by keyword, author, endpoint..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg text-slate-800"
          />
        </div>

        {/* Evidence Hierarchy Filter Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-medium text-slate-400 pl-1 pr-1">Evidence:</span>
          {[
            { id: 'all', label: 'All Levels' },
            { id: '1', label: 'Level 1 (SR / RCT)' },
            { id: '2', label: 'Level 2 (Cohort)' },
            { id: '3', label: 'Level 3 (RWE)' },
            { id: '4', label: 'Level 4 (Preclinical)' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setFilterLevel(lvl.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                filterLevel === lvl.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Studies List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
            No research studies match your current filter. Try resetting evidence tier or search query.
          </div>
        ) : (
          filtered.map((study) => {
            const isExpanded = expandedId === study.id;
            const evidence = study.evidence_hierarchy || { level: 'Level 2', tier: 'Clinical Study', badge: 'Clinical Evidence' };

            return (
              <div
                key={study.id}
                onDoubleClick={() => onOpenDetailModal(study)}
                className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-xs transition-all duration-150 p-4 sm:p-5 cursor-pointer group"
                title="Double-click to inspect verified research and clinical endpoints in-depth"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Evidence Level Badge */}
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getEvidenceBadgeClass(evidence.level)}`}>
                      {evidence.level}: {evidence.tier}
                    </span>

                    {/* Vetted Therapeutic Area Badge */}
                    {study.therapeutic_area && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {study.therapeutic_area}
                      </span>
                    )}

                    {/* Vetted Molecule/Product Badge */}
                    {study.molecule_or_product && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200">
                        {study.molecule_or_product}
                      </span>
                    )}

                    {/* Repository Source Provenance Badge */}
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {study.repo}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 self-end sm:self-auto">
                    <button
                      onClick={(e) => handleCopyCitation(study, e)}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      title="Copy APA Citation"
                    >
                      {copiedId === study.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={study.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-slate-100 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Open Verified Record"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Study Title */}
                <h4
                  onClick={() => onOpenDetailModal(study)}
                  className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer leading-snug mb-1.5 transition-colors"
                >
                  {study.title}
                </h4>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-2.5">
                  <span className="font-medium text-slate-700">{study.authors}</span>
                  <span>•</span>
                  <span className="font-medium italic text-slate-600">{study.journal}</span>
                  <span>•</span>
                  <span>{study.display_date || 'Recent'}</span>
                  {study.doi && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-500">DOI: {study.doi}</span>
                    </>
                  )}
                  {study.pmid && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-blue-700 font-medium">PMID: {study.pmid}</span>
                    </>
                  )}
                </div>

                {/* MeSH Keywords */}
                {study.mesh_terms && study.mesh_terms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {study.mesh_terms.map((mesh: string, mIdx: number) => (
                      <span
                        key={mIdx}
                        className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-[10px] text-slate-500 font-mono"
                      >
                        {mesh}
                      </span>
                    ))}
                  </div>
                )}

                {/* Abstract Preview */}
                <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                  <p className={isExpanded ? '' : 'line-clamp-2'}>
                    {study.abstract || 'Structured abstract indexed in full NCBI PubMed article.'}
                  </p>
                  {study.abstract && study.abstract.length > 180 && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : study.id)}
                      className="mt-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center space-x-0.5"
                    >
                      <span>{isExpanded ? 'Show less' : 'Read full abstract'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
