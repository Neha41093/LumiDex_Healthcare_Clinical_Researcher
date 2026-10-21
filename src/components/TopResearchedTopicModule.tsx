import React from 'react';
import { 
  TrendingUp, 
  FlaskConical, 
  BookOpen, 
  ExternalLink, 
  Award, 
  Activity, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { ScraperResponse, PubMedStudy, ClinicalTrial, EuropePMCStudy } from '../types';

interface TopResearchedTopicModuleProps {
  data: ScraperResponse;
  onOpenDetailModal?: (item: any) => void;
  onSelectTopic?: (topicName: string) => void;
}

interface TopicInsight {
  topMolecule: string;
  topTherapeuticArea: string;
  studyCount: number;
  totalStudies: number;
  studySharePct: number;
  evidenceTierSummary: string;
  dominantIndications: string[];
  coResearchedMolecules: Array<{ name: string; count: number }>;
  landmarkStudy: {
    id: string;
    title: string;
    source: string;
    journalOrPhase: string;
    citationText: string;
    rawItem: any;
  } | null;
}

/**
 * Analyzes scraped studies to identify the most researched molecule/topic
 * weighted by citation volume, domain hits, and clinical trial evidence tiers.
 */
export function analyzeTopResearchTopic(data: ScraperResponse): TopicInsight {
  const pubmedList: PubMedStudy[] = data.verified_studies?.pubmed_literature || [];
  const trialsList: ClinicalTrial[] = data.verified_studies?.clinical_trials || [];
  const preprintsList: EuropePMCStudy[] = data.verified_studies?.europe_pmc_preprints || [];
  
  const totalStudies = pubmedList.length + trialsList.length + preprintsList.length;

  if (totalStudies === 0) {
    return {
      topMolecule: data.query || 'Biomedical Target',
      topTherapeuticArea: data.therapeutic_area || 'Clinical Research',
      studyCount: 0,
      totalStudies: 0,
      studySharePct: 0,
      evidenceTierSummary: 'No verified studies indexed yet',
      dominantIndications: [],
      coResearchedMolecules: [],
      landmarkStudy: null
    };
  }

  // Maps to accumulate weighted scores and study occurrences
  const moleculeStats: Record<string, { count: number; weightedImpact: number; area: string; items: any[] }> = {};
  const areaCounts: Record<string, number> = {};
  const allIndications: Record<string, number> = {};

  // Helper to extract clean molecule name
  const cleanMoleculeName = (raw?: string, title?: string): string => {
    if (raw && raw.trim() && raw.trim() !== 'Clinical Candidate') {
      return raw.replace(/^(Drug|Biological|Other):\s*/i, '').trim();
    }
    // Try extracting from query or title keywords if raw missing
    if (data.query) {
      const q = data.query.trim();
      if (q.length > 2 && q.length < 40) return q;
    }
    return 'Lead Therapeutic Candidate';
  };

  // 1. Process PubMed studies
  pubmedList.forEach((p) => {
    const mol = cleanMoleculeName(p.molecule_or_product, p.title);
    const area = p.therapeutic_area || data.therapeutic_area || 'Clinical Medicine';
    const impactScore = (p.evidence_hierarchy?.score || 80) + (p.total_domain_hits > 1000 ? 30 : 10);

    if (!moleculeStats[mol]) {
      moleculeStats[mol] = { count: 0, weightedImpact: 0, area, items: [] };
    }
    moleculeStats[mol].count += 1;
    moleculeStats[mol].weightedImpact += impactScore;
    moleculeStats[mol].items.push({ item: p, score: impactScore, type: 'PubMed' });

    areaCounts[area] = (areaCounts[area] || 0) + 1;

    (p.mesh_terms || []).forEach((term) => {
      allIndications[term] = (allIndications[term] || 0) + 1;
    });
  });

  // 2. Process Clinical Trials
  trialsList.forEach((t) => {
    const molRaw = t.molecule_or_product || (t.interventions && t.interventions[0]);
    const mol = cleanMoleculeName(molRaw, t.title);
    const area = t.therapeutic_area || data.therapeutic_area || 'Interventional Protocols';
    
    // Higher weight for Phase 3 and large enrollment
    const isPhase3 = (t.phase || '').toLowerCase().includes('phase 3');
    const impactScore = (isPhase3 ? 110 : 85) + (t.enrollment > 500 ? 35 : 15);

    if (!moleculeStats[mol]) {
      moleculeStats[mol] = { count: 0, weightedImpact: 0, area, items: [] };
    }
    moleculeStats[mol].count += 1;
    moleculeStats[mol].weightedImpact += impactScore;
    moleculeStats[mol].items.push({ item: t, score: impactScore, type: 'Trial' });

    areaCounts[area] = (areaCounts[area] || 0) + 1;

    (t.conditions || []).forEach((c) => {
      allIndications[c] = (allIndications[c] || 0) + 1;
    });
  });

  // 3. Process Europe PMC
  preprintsList.forEach((e) => {
    const mol = cleanMoleculeName(e.molecule_or_product, e.title);
    const area = e.therapeutic_area || data.therapeutic_area || 'Biomedical Preprints';
    const impactScore = 75 + Math.min(e.citations * 8, 80);

    if (!moleculeStats[mol]) {
      moleculeStats[mol] = { count: 0, weightedImpact: 0, area, items: [] };
    }
    moleculeStats[mol].count += 1;
    moleculeStats[mol].weightedImpact += impactScore;
    moleculeStats[mol].items.push({ item: e, score: impactScore, type: 'Preprint' });

    areaCounts[area] = (areaCounts[area] || 0) + 1;
  });

  // Determine top molecule by weighted impact & study frequency
  const sortedMolecules = Object.entries(moleculeStats).sort((a, b) => {
    // Primary: weighted impact; Secondary: count
    if (b[1].weightedImpact !== a[1].weightedImpact) {
      return b[1].weightedImpact - a[1].weightedImpact;
    }
    return b[1].count - a[1].count;
  });

  const topEntry = sortedMolecules[0] || [data.query || 'Target Modality', { count: totalStudies, weightedImpact: 100, area: data.therapeutic_area || 'Biomedical Research', items: [] }];
  const topMolecule = topEntry[0];
  const topMeta = topEntry[1];

  // Determine dominant therapeutic area
  const sortedAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]);
  const topTherapeuticArea = sortedAreas[0] ? sortedAreas[0][0] : (data.therapeutic_area || 'Biomedical Science');

  // Find single landmark study backing this top topic
  let landmarkStudy: TopicInsight['landmarkStudy'] = null;
  if (topMeta.items.length > 0) {
    const highestScoring = [...topMeta.items].sort((a, b) => b.score - a.score)[0];
    const raw = highestScoring.item;
    if (highestScoring.type === 'PubMed') {
      landmarkStudy = {
        id: `PMID:${raw.pmid}`,
        title: raw.title,
        source: 'NCBI PubMed',
        journalOrPhase: raw.journal,
        citationText: raw.total_domain_hits ? `${raw.total_domain_hits.toLocaleString()} domain citations / hits` : 'Pivotal Citation',
        rawItem: raw
      };
    } else if (highestScoring.type === 'Trial') {
      landmarkStudy = {
        id: raw.id,
        title: raw.title,
        source: 'ClinicalTrials.gov',
        journalOrPhase: raw.phase || 'Interventional Protocol',
        citationText: raw.enrollment ? `${raw.enrollment.toLocaleString()} patients enrolled` : 'Registered Protocol',
        rawItem: raw
      };
    } else {
      landmarkStudy = {
        id: raw.id,
        title: raw.title,
        source: 'Europe PMC',
        journalOrPhase: raw.journal || 'Peer-Reviewed Literature',
        citationText: `${raw.citations || 0} citations`,
        rawItem: raw
      };
    }
  }

  // Co-researched molecules (runners up)
  const coResearchedMolecules = sortedMolecules
    .slice(1, 4)
    .filter(([name]) => name.toLowerCase() !== topMolecule.toLowerCase())
    .map(([name, stat]) => ({ name, count: stat.count }));

  // Dominant indications (top 3)
  const dominantIndications = Object.entries(allIndications)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  // Evidence tier summary
  const phase3Count = data.metrics?.phase_distribution?.['Phase 3'] ?? trialsList.filter(t => (t.phase || '').includes('3')).length;
  const totalScraped = data.metrics?.summary_counts?.total_studies_scraped || totalStudies;
  const studySharePct = Math.round((topMeta.count / Math.max(totalStudies, 1)) * 100);

  let evidenceTierSummary = `${topMeta.count} of ${totalStudies} studies (${studySharePct}%)`;
  if (phase3Count > 0) {
    evidenceTierSummary += ` · Includes ${phase3Count} Phase 3 pivotal trial${phase3Count > 1 ? 's' : ''}`;
  }

  return {
    topMolecule,
    topTherapeuticArea,
    studyCount: topMeta.count,
    totalStudies,
    studySharePct,
    evidenceTierSummary,
    dominantIndications,
    coResearchedMolecules,
    landmarkStudy
  };
}

export const TopResearchedTopicModule: React.FC<TopResearchedTopicModuleProps> = ({
  data,
  onOpenDetailModal,
  onSelectTopic
}) => {
  const insight = analyzeTopResearchTopic(data);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-[0_2px_14px_-4px_rgba(15,23,42,0.06)] overflow-hidden transition-all duration-150">
      {/* Top Banner Bar: Unboxed clean metadata kicker */}
      <div className="px-4 sm:px-5 pt-3.5 pb-2.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-5 h-5 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold uppercase tracking-wider text-slate-900 text-[11px]">
            Top Researched Topic
          </span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="text-slate-500 text-[11px]">
            Most Cited & Evaluated Clinical Frontier
          </span>
        </div>

        {/* Quiet unboxed evidence share metadata */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium self-start sm:self-auto">
          <span className="text-blue-700 font-semibold">{insight.evidenceTierSummary}</span>
        </div>
      </div>

      {/* Main Topic Focus Area */}
      <div className="p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          
          {/* Left Column: Dominant Molecule & Therapeutic Area Identification */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span className="font-semibold text-blue-700">{insight.topTherapeuticArea}</span>
              <span className="text-slate-300" aria-hidden="true">/</span>
              <span className="font-medium text-slate-600">Dominant Modality</span>
            </div>

            <div className="flex items-baseline space-x-3">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 font-sans">
                {insight.topMolecule}
              </h3>
              <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                #{1} Research Concentration
              </span>
            </div>

            {/* Indications & Therapeutic Targets */}
            {insight.dominantIndications.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-600">
                <span className="font-medium text-slate-500 text-[11px] uppercase tracking-wider">
                  Primary Indications:
                </span>
                {insight.dominantIndications.map((ind, i) => (
                  <span key={i} className="inline-flex items-center">
                    <span className="font-medium text-slate-800">{ind}</span>
                    {i < insight.dominantIndications.length - 1 && (
                      <span className="text-slate-300 mx-1.5">·</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column / Co-Researched Counterparts */}
          {insight.coResearchedMolecules.length > 0 && (
            <div className="lg:w-72 bg-slate-50/80 rounded-xl p-3 border border-slate-150 shrink-0 space-y-1.5 text-xs">
              <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Co-Researched Compounds</span>
                <span className="text-slate-400 font-mono text-[10px]">Scraped</span>
              </div>
              <div className="space-y-1">
                {insight.coResearchedMolecules.map((co) => (
                  <div 
                    key={co.name} 
                    className="flex items-center justify-between text-slate-700 py-0.5"
                  >
                    <span className="truncate font-medium">{co.name}</span>
                    <span className="text-slate-500 font-mono text-[11px] ml-2">
                      {co.count} {co.count === 1 ? 'study' : 'studies'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Anchor Landmark Study Card */}
        {insight.landmarkStudy && (
          <div 
            onClick={() => onOpenDetailModal && insight.landmarkStudy?.rawItem && onOpenDetailModal(insight.landmarkStudy.rawItem)}
            className="p-3 bg-slate-50/90 hover:bg-blue-50/40 rounded-xl border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs"
          >
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <span className="font-bold text-blue-700 uppercase tracking-wider text-[10px]">
                  Highest-Impact Citation Anchor
                </span>
                <span className="text-slate-300">·</span>
                <span className="font-medium text-slate-700">{insight.landmarkStudy.journalOrPhase}</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-slate-600">{insight.landmarkStudy.id}</span>
              </div>
              <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                {insight.landmarkStudy.title}
              </p>
              <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                <span>Source: {insight.landmarkStudy.source}</span>
                <span className="text-slate-300">·</span>
                <span className="font-medium text-emerald-700">{insight.landmarkStudy.citationText}</span>
              </div>
            </div>

            <div className="self-end sm:self-center shrink-0 flex items-center space-x-1.5 text-xs text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
              <span>Inspect Protocol</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
