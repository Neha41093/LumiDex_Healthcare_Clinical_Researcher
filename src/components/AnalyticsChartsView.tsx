import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  Award, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { AnalyticsMetrics } from '../types';

interface AnalyticsChartsViewProps {
  metrics: AnalyticsMetrics;
}

export const AnalyticsChartsView: React.FC<AnalyticsChartsViewProps> = ({ metrics }) => {
  const phaseData = metrics.phase_distribution;
  const sponsorData = metrics.sponsor_breakdown;
  const evidenceData = metrics.evidence_hierarchy_breakdown;
  const commercial = metrics.commercial_analytics;
  const clinical = metrics.clinical_analytics;

  // Max calculations for relative bar widths
  const maxPhaseVal = Math.max(...Object.values(phaseData), 1);
  const totalSponsors = Math.max(Object.values(sponsorData).reduce((a, b) => a + b, 0), 1);
  const totalEvidence = Math.max(Object.values(evidenceData).reduce((a, b) => a + b, 0), 1);

  return (
    <div className="space-y-6">
      {/* Top Indicators Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Commercial Maturity Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Commercial Pipeline Maturity</h3>
                <span className="text-[11px] text-slate-500">Biopharma commercialization & Phase 3 index</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-emerald-600">
                {commercial.maturity_index}
              </span>
              <span className="text-xs font-semibold text-slate-400">/100</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${commercial.maturity_index}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[11px] block">Commercial Classification</span>
              <span className="font-semibold text-slate-800">{commercial.commercial_opportunity_tier}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[11px] block">Industry Share</span>
              <span className="font-semibold text-slate-800">{commercial.industry_pipeline_share_pct}% Pipeline</span>
            </div>
          </div>
        </div>

        {/* Clinical Evidence Rigor Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Clinical Evidence Rigor Score</h3>
                <span className="text-[11px] text-slate-500">Oxford CEBM evidence & trial design rigor</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-blue-600">
                {clinical.evidence_rigor_score}
              </span>
              <span className="text-xs font-semibold text-slate-400">/100</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${clinical.evidence_rigor_score}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[11px] block">Evidence Base Tier</span>
              <span className="font-semibold text-slate-800 truncate block">{clinical.evidence_tier}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[11px] block">Pivotal Studies</span>
              <span className="font-semibold text-slate-800">{clinical.rct_and_phase3_count} Level 1 / P3 Trials</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Clinical Trial Phase Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">Clinical Trial Phase Distribution</h4>
            </div>
            <span className="text-xs font-mono text-slate-400">CT.gov Studies</span>
          </div>

          <div className="space-y-3">
            {Object.entries(phaseData).map(([phase, count]) => {
              const pct = Math.round((count / maxPhaseVal) * 100);
              const isP3 = phase.includes('3');
              return (
                <div key={phase} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium ${isP3 ? 'text-indigo-900 font-bold' : 'text-slate-700'}`}>
                      {phase}
                    </span>
                    <span className="font-mono text-slate-500 font-semibold">{count} trials</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isP3 ? 'bg-indigo-600' : 'bg-blue-400'
                      }`}
                      style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
            <strong>Phase 3 Registrational Impact:</strong> {phaseData['Phase 3']} pivotal Phase 3 trials are actively underway, representing near-term regulatory filing milestones and market entry potential.
          </div>
        </div>

        {/* Sponsor Profile: Industry vs Academic */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">Commercial vs Academic Sponsor Profile</h4>
            </div>
            <span className="text-xs font-mono text-slate-400">Sponsorship Split</span>
          </div>

          {/* Segmented Stacked Bar */}
          <div className="space-y-3">
            <div className="h-6 w-full rounded-lg overflow-hidden flex shadow-2xs">
              <div
                style={{ width: `${(sponsorData['Industry / Biopharma'] / totalSponsors) * 100}%` }}
                className="bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center transition-all"
                title={`Industry: ${sponsorData['Industry / Biopharma']}`}
              >
                {sponsorData['Industry / Biopharma'] > 0 && `${Math.round((sponsorData['Industry / Biopharma'] / totalSponsors) * 100)}%`}
              </div>
              <div
                style={{ width: `${(sponsorData['Academic / Hospital / NIH'] / totalSponsors) * 100}%` }}
                className="bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center transition-all"
                title={`Academic: ${sponsorData['Academic / Hospital / NIH']}`}
              >
                {sponsorData['Academic / Hospital / NIH'] > 0 && `${Math.round((sponsorData['Academic / Hospital / NIH'] / totalSponsors) * 100)}%`}
              </div>
              <div
                style={{ width: `${(sponsorData['Other Collaborations'] / totalSponsors) * 100}%` }}
                className="bg-slate-400 text-white text-[11px] font-bold flex items-center justify-center transition-all"
                title={`Other: ${sponsorData['Other Collaborations']}`}
              >
                {sponsorData['Other Collaborations'] > 0 && 'Other'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="flex items-start space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 block">Biopharma Industry</span>
                  <span className="text-slate-500 text-[11px]">
                    {sponsorData['Industry / Biopharma']} commercial assets ({Math.round((sponsorData['Industry / Biopharma'] / totalSponsors) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 block">Academic & NIH</span>
                  <span className="text-slate-500 text-[11px]">
                    {sponsorData['Academic / Hospital / NIH']} investigator-led ({Math.round((sponsorData['Academic / Hospital / NIH'] / totalSponsors) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
            <strong>Investment Outlook:</strong> {commercial.market_indicator}. High commercial funding signals strong patent defense, aggressive market access investment, and pricing power.
          </div>
        </div>
      </div>

      {/* Oxford Evidence Hierarchy Breakdown */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <h4 className="text-sm font-bold text-slate-900">Oxford CEBM Evidence Hierarchy Breakdown</h4>
          </div>
          <span className="text-xs text-slate-500">Methodological Rigor</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              level: 'Level 1',
              label: 'Systematic Reviews & RCTs',
              count: evidenceData['Level 1 (SR/RCT)'],
              desc: 'Highest methodological rigor, minimal bias.',
              badge: 'Grade A Evidence',
              border: 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
            },
            {
              level: 'Level 2',
              label: 'Controlled & Cohort Studies',
              count: evidenceData['Level 2 (Cohort/Controlled)'],
              desc: 'Pivotal registration & prospective arms.',
              badge: 'Grade B Evidence',
              border: 'border-blue-200 bg-blue-50/40 text-blue-900'
            },
            {
              level: 'Level 3',
              label: 'Real-World Evidence (RWE)',
              count: evidenceData['Level 3 (RWE/Retrospective)'],
              desc: 'Retrospective, registry & claims data.',
              badge: 'Real-World Practice',
              border: 'border-amber-200 bg-amber-50/40 text-amber-900'
            },
            {
              level: 'Level 4',
              label: 'Preclinical & Mechanistic',
              count: evidenceData['Level 4 (Preclinical)'],
              desc: 'Translational biology & animal models.',
              badge: 'Early Discovery',
              border: 'border-slate-200 bg-slate-50/60 text-slate-800'
            }
          ].map((item) => (
            <div key={item.level} className={`p-3.5 rounded-xl border ${item.border} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs font-mono">{item.level}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-current">
                  {item.badge}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono">
                {item.count}
              </div>
              <div className="font-semibold text-xs leading-tight">
                {item.label}
              </div>
              <p className="text-[11px] opacity-80 leading-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
