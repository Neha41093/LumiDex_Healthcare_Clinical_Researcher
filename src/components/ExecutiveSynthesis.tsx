import React from 'react';
import { 
  Award, 
  Users, 
  Building2, 
  FileText, 
  FlaskConical, 
  ExternalLink,
  Clock,
  Sparkles,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { ScraperResponse } from '../types';
import { TopResearchedTopicModule } from './TopResearchedTopicModule';

interface ExecutiveSynthesisProps {
  data: ScraperResponse;
  onSelectTab: (tab: string) => void;
  onOpenDetailModal?: (item: any) => void;
  onAskAssistant?: (prompt: string) => void;
}

interface SlabTheme {
  cardBorder: string;
  cardBg: string;
  leftRail: string;
  badgeBg: string;
  areaText: string;
  moleculeText: string;
  highlightBg: string;
  highlightBorder: string;
  highlightLabel: string;
  hoverBorder: string;
  actionText: string;
}

const SLAB_THEMES: SlabTheme[] = [
  // 1. Shade 1: Royal / Cobalt Blue (Deep & Grounded)
  {
    cardBorder: 'border-blue-200/90',
    cardBg: 'bg-gradient-to-r from-blue-50/75 via-blue-50/20 to-white',
    leftRail: 'border-l-4 border-l-blue-600',
    badgeBg: 'bg-blue-100 text-blue-900 border border-blue-300/80',
    areaText: 'text-blue-700',
    moleculeText: 'text-blue-950',
    highlightBg: 'bg-blue-50/90 text-blue-950',
    highlightBorder: 'border-blue-200/80',
    highlightLabel: 'text-blue-800',
    hoverBorder: 'hover:border-blue-400',
    actionText: 'text-blue-700 hover:text-blue-900'
  },
  // 2. Shade 2: Sky / Ice Blue (Crisp & Luminous)
  {
    cardBorder: 'border-sky-200/90',
    cardBg: 'bg-gradient-to-r from-sky-50/75 via-sky-50/20 to-white',
    leftRail: 'border-l-4 border-l-sky-400',
    badgeBg: 'bg-sky-100 text-sky-900 border border-sky-300/80',
    areaText: 'text-sky-700',
    moleculeText: 'text-sky-950',
    highlightBg: 'bg-sky-50/90 text-sky-950',
    highlightBorder: 'border-sky-200/80',
    highlightLabel: 'text-sky-800',
    hoverBorder: 'hover:border-sky-400',
    actionText: 'text-sky-700 hover:text-sky-900'
  }
];

export const ExecutiveSynthesis: React.FC<ExecutiveSynthesisProps> = ({
  data,
  onSelectTab,
  onOpenDetailModal,
  onAskAssistant
}) => {
  const metrics = data.metrics;
  const trials = data.verified_studies.clinical_trials || [];
  const literature = data.verified_studies.pubmed_literature || [];
  const preprints = data.verified_studies.europe_pmc_preprints || [];

  const handleRowClick = (item: any) => {
    if (onOpenDetailModal && item) {
      onOpenDetailModal(item);
    }
  };

  // Dominant therapeutic area from real data
  const dominantArea = data.therapeutic_area || (trials[0]?.therapeutic_area || literature[0]?.therapeutic_area || 'Biomedical Science');

  // Compute dataset temporal freshness with exact date and time
  const formatTimestamp = (iso?: string) => {
    if (!iso) {
      return { 
        formattedDate: 'Current session', 
        formattedTime: '', 
        isFresh: true, 
        ageText: 'Fresh scrape' 
      };
    }
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) {
        return { 
          formattedDate: 'Current session', 
          formattedTime: '', 
          isFresh: true, 
          ageText: 'Fresh scrape' 
        };
      }
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const isFresh = diffMinutes < 120;

      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let ageText = `${diffMinutes}m ago`;
      if (diffMinutes < 2) ageText = 'Just now';
      else if (diffHours >= 1 && diffHours < 24) ageText = `${diffHours}h ago`;
      else if (diffHours >= 24) ageText = `${Math.floor(diffHours / 24)}d ago`;

      return {
        formattedDate: dateStr,
        formattedTime: timeStr,
        fullTimestamp: `${dateStr} at ${timeStr}`,
        isFresh,
        ageText
      };
    } catch {
      return { 
        formattedDate: 'Current session', 
        formattedTime: '', 
        isFresh: true, 
        ageText: 'Fresh scrape' 
      };
    }
  };

  const scrapeFreshness = formatTimestamp(data.timestamp);

  // Compile individual verified research insights directly from the scraped items
  const researchInsightItems = [
    ...trials.slice(0, 5).map((t) => ({
      key: `trial-${t.id}`,
      type: 'Clinical Trial',
      id: t.id,
      title: t.title,
      sourceBadge: `ClinicalTrials.gov · ${t.id}`,
      phase: t.phase || 'Interventional Protocol',
      sponsor: t.sponsor,
      sponsorClass: t.is_commercial_industry ? 'Industry Biopharma' : 'Academic / Hospital',
      therapeuticArea: t.therapeutic_area || dominantArea,
      moleculeProduct: t.molecule_or_product || (t.interventions && t.interventions[0] ? t.interventions[0].replace(/^(Drug|Biological|Other):\s*/i, '') : 'Clinical Candidate'),
      highlightLabel: t.primary_endpoints && t.primary_endpoints.length > 0 ? 'Primary Endpoint' : 'Study Protocol',
      highlightText: t.primary_endpoints && t.primary_endpoints[0] ? t.primary_endpoints[0] : (t.summary ? (t.summary.length > 170 ? t.summary.slice(0, 170) + '...' : t.summary) : undefined),
      url: t.url,
      rawItem: t
    })),
    ...literature.slice(0, 5).map((l) => ({
      key: `pub-${l.pmid}`,
      type: 'Peer-Reviewed Study',
      id: `PMID:${l.pmid}`,
      title: l.title,
      sourceBadge: `NCBI PubMed · PMID:${l.pmid}`,
      phase: l.journal,
      sponsor: l.authors,
      sponsorClass: l.journal,
      therapeuticArea: l.therapeutic_area || dominantArea,
      moleculeProduct: l.molecule_or_product || (l.mesh_terms && l.mesh_terms[0] ? l.mesh_terms[0] : 'Investigational Molecule'),
      highlightLabel: 'Clinical Abstract / Finding',
      highlightText: l.abstract ? (l.abstract.length > 170 ? l.abstract.slice(0, 170) + '...' : l.abstract) : undefined,
      url: l.url,
      rawItem: l
    })),
    ...preprints.slice(0, 2).map((p) => ({
      key: `epmc-${p.id}`,
      type: p.source_type,
      id: p.id,
      title: p.title,
      sourceBadge: `Europe PMC · ${p.id}`,
      phase: p.journal,
      sponsor: p.authors,
      sponsorClass: p.journal,
      therapeuticArea: p.therapeutic_area || dominantArea,
      moleculeProduct: p.molecule_or_product || 'Biomedical Investigation',
      highlightLabel: 'Preprint Summary',
      highlightText: p.abstract ? (p.abstract.length > 170 ? p.abstract.slice(0, 170) + '...' : p.abstract) : undefined,
      url: p.url,
      rawItem: p
    }))
  ];

  return (
    <div className="space-y-3.5 font-sans">
      {/* Top Scrape Provenance & Single Authoritative Freshness Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/70 p-3.5 shadow-[0_2px_12px_-4px_rgba(148,163,184,0.12)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-800">
                Data Freshness Status:
              </span>
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                scrapeFreshness.isFresh 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${scrapeFreshness.isFresh ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span>{scrapeFreshness.ageText}</span>
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                Manual refresh only
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Clinical evidence retrieved on <span className="font-medium text-slate-700">{scrapeFreshness.fullTimestamp || scrapeFreshness.formattedDate}</span> from open biomedical repositories
            </p>
          </div>
        </div>
      </div>

      {/* Top Researched Topic Module: Highlights the most cited molecule / therapeutic frontier */}
      <TopResearchedTopicModule 
        data={data} 
        onOpenDetailModal={onOpenDetailModal}
      />

      {/* Verified Factual Counts - 4 Essential Clinical Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium text-slate-500">Total Indexed</span>
            <FileText className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {metrics?.summary_counts?.total_studies_scraped ?? (trials.length + literature.length)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {metrics?.summary_counts?.pubmed_papers ?? literature.length} PubMed · {metrics?.summary_counts?.clinical_trials ?? trials.length} Trials
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium text-slate-500">Phase 3 Pivotal</span>
            <Award className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {metrics?.phase_distribution?.['Phase 3'] ?? trials.filter((t: any) => (t.phase || '').includes('3')).length}
          </div>
          <div className="text-[10px] text-indigo-600 font-medium mt-0.5">
            Pivotal Registrations
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium text-slate-500">Industry Sponsors</span>
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {metrics?.sponsor_breakdown?.['Industry / Biopharma'] ?? trials.filter((t: any) => t.is_commercial_industry).length}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5 truncate">
            Commercial Biopharma
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium text-slate-500">Patients Enrolled</span>
            <Users className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight truncate">
            {(metrics?.summary_counts?.total_patients_enrolled ?? 0) > 0
              ? (metrics?.summary_counts?.total_patients_enrolled ?? 0).toLocaleString()
              : 'Indexed'}
          </div>
          <div className="text-[10px] text-amber-600 font-medium mt-0.5 truncate">
            {metrics?.summary_counts?.actively_recruiting_trials ?? trials.filter((t: any) => (t.status || '').toUpperCase().includes('RECRUITING')).length} Recruiting Trials
          </div>
        </div>
      </div>

      {/* Synthesized Research Insights - Sleek, Reduced Detail Slabs */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/70 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 gap-1.5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Synthesized Research Insights</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified clinical findings. Click any slab to view complete protocol or ask the assistant.
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-medium self-start sm:self-auto">
            Click to view full protocol
          </span>
        </div>

        {/* List of Insight Slabs */}
        {researchInsightItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50/60 rounded-xl border border-slate-100">
            No research records were returned for "{data.query}". Please try another search term.
          </div>
        ) : (
          researchInsightItems.map((item, idx) => {
            const theme = SLAB_THEMES[idx % SLAB_THEMES.length];
            return (
              <div
                key={item.key}
                onClick={() => handleRowClick(item.rawItem)}
                className={`rounded-xl border ${theme.cardBorder} ${theme.cardBg} ${theme.leftRail} ${theme.hoverBorder} p-4 transition-all duration-150 hover:shadow-xs cursor-pointer space-y-2.5 group`}
              >
                {/* Slab Title Bar: Explicit Index + Therapeutic Area + Molecule/Product */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-150/70">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${theme.badgeBg}`}>
                      #{idx + 1}
                    </span>
                    <div className="text-xs font-bold text-slate-900">
                      <span className={theme.areaText}>{item.therapeuticArea}</span>
                      <span className="text-slate-300 mx-1.5">/</span>
                      <span className={`font-mono ${theme.moleculeText}`}>{item.moleculeProduct}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{item.phase}</span>
                    <span>·</span>
                    <span className="font-medium text-slate-600">{item.sourceBadge}</span>
                  </div>
                </div>

                {/* Research Title from actual public record */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-950 group-hover:text-blue-700 transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700">{item.type}</span>
                    <span>·</span>
                    <span className="italic text-slate-600">{item.sponsorClass || item.sponsor}</span>
                  </div>
                </div>

                {/* Highlight Container: Primary Endpoint or Clinical Takeaway */}
                {item.highlightText && (
                  <div className={`text-xs ${theme.highlightBg} px-3 py-2 rounded-lg border ${theme.highlightBorder} flex items-start space-x-2`}>
                    <span className={`font-bold ${theme.highlightLabel} shrink-0 text-[11px] uppercase tracking-wider mt-0.5`}>
                      {item.highlightLabel}:
                    </span>
                    <span className="text-slate-800 line-clamp-2 leading-relaxed">
                      {item.highlightText}
                    </span>
                  </div>
                )}

                {/* Slab Footer Actions: View Details + Ask Assistant */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-150/70">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 font-medium">Source:</span>
                    <span className="text-blue-700 font-mono text-[11px] font-semibold">{item.id}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-blue-600"
                      title="Open external source"
                    >
                      <ExternalLink className="w-3.5 h-3.5 inline" />
                    </a>
                  </div>

                  <div className="flex items-center space-x-3">
                    {onAskAssistant && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAskAssistant(`Tell me more about ${item.id} (${item.moleculeProduct})`);
                        }}
                        className="text-[11px] text-slate-600 hover:text-blue-700 font-medium inline-flex items-center space-x-1 cursor-pointer"
                        title="Ask Assistant about this study"
                      >
                        <MessageSquare className="w-3 h-3 text-blue-500" />
                        <span>Ask Assistant</span>
                      </button>
                    )}
                    <span className={`text-[11px] ${theme.actionText} font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center space-x-1`}>
                      <span>View Protocol</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
