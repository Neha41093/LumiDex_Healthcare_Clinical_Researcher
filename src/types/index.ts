export interface EvidenceHierarchy {
  level: string;
  tier: string;
  badge: string;
  score: number;
  color: 'emerald' | 'blue' | 'amber' | 'indigo' | 'slate';
}

export interface PubMedStudy {
  id: string;
  source_type: string;
  title: string;
  authors: string;
  journal: string;
  pub_date: string;
  doi?: string;
  pmid: string;
  url: string;
  abstract: string;
  evidence_hierarchy: EvidenceHierarchy;
  mesh_terms: string[];
  total_domain_hits: number;
  commercial_relevance: 'High' | 'Moderate' | 'Translational';
  data_provenance: string;
  therapeutic_area?: string;
  molecule_or_product?: string;
}

export interface ClinicalTrial {
  id: string; // NCT ID
  source_type: string;
  title: string;
  official_title: string;
  status: string;
  phase: string;
  phases_raw: string[];
  sponsor: string;
  sponsor_class: string;
  is_commercial_industry: boolean;
  enrollment: number;
  conditions: string[];
  interventions: string[];
  primary_endpoints: string[];
  summary: string;
  url: string;
  evidence_tier: string;
  evidence_score: number;
  data_provenance: string;
  therapeutic_area?: string;
  molecule_or_product?: string;
}

export interface EuropePMCStudy {
  id: string;
  source_type: string;
  title: string;
  authors: string;
  journal: string;
  pub_year: string;
  doi?: string;
  pmid?: string;
  citations: number;
  is_open_access: boolean;
  abstract: string;
  url: string;
  evidence_hierarchy: EvidenceHierarchy;
  commercial_relevance: 'High' | 'Moderate';
  data_provenance: string;
  therapeutic_area?: string;
  molecule_or_product?: string;
}

export interface HealthcareDataset {
  id: string;
  name: string;
  provider: string;
  scope: string;
  records: string;
  url: string;
  access: string;
  therapeutic_areas: string[];
  clinical_use: string;
  commercial_use: string;
  relevance_score?: number;
}

export interface CommercialAnalytics {
  maturity_index: number;
  industry_pipeline_share_pct: number;
  commercial_opportunity_tier: string;
  regulatory_density: string;
  market_indicator: string;
}

export interface ClinicalAnalytics {
  evidence_rigor_score: number;
  evidence_tier: string;
  rct_and_phase3_count: number;
}

export interface AnalyticsMetrics {
  summary_counts: {
    total_studies_scraped: number;
    pubmed_papers: number;
    clinical_trials: number;
    europe_pmc_preprints: number;
    healthcare_datasets_matched: number;
    total_patients_enrolled: number;
    actively_recruiting_trials: number;
  };
  phase_distribution: {
    'Phase 1': number;
    'Phase 2': number;
    'Phase 3': number;
    'Phase 4': number;
    'Other/Observational': number;
  };
  sponsor_breakdown: {
    'Industry / Biopharma': number;
    'Academic / Hospital / NIH': number;
    'Other Collaborations': number;
  };
  evidence_hierarchy_breakdown: {
    'Level 1 (SR/RCT)': number;
    'Level 2 (Cohort/Controlled)': number;
    'Level 3 (RWE/Retrospective)': number;
    'Level 4 (Preclinical)': number;
  };
  commercial_analytics: CommercialAnalytics;
  clinical_analytics: ClinicalAnalytics;
}

export interface ExecutionMeta {
  exit_code: number;
  command: string;
  server_duration_sec: number;
  stderr_logs: string[];
}

export interface ScraperResponse {
  status: string;
  query: string;
  therapeutic_area: string;
  source: string;
  timestamp: string;
  execution_duration_sec: number;
  metrics: AnalyticsMetrics;
  verified_studies: {
    pubmed_literature: PubMedStudy[];
    clinical_trials: ClinicalTrial[];
    europe_pmc_preprints: EuropePMCStudy[];
  };
  healthcare_datasets: HealthcareDataset[];
  execution_meta?: ExecutionMeta;
}
