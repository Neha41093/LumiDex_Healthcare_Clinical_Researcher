import React, { useState } from 'react';
import { 
  FlaskConical, 
  ExternalLink, 
  Users, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter,
  Check,
  Award
} from 'lucide-react';
import { ClinicalTrial } from '../types';

interface ClinicalTrialsViewProps {
  trials: ClinicalTrial[];
  onOpenDetailModal: (trial: any) => void;
}

export const ClinicalTrialsView: React.FC<ClinicalTrialsViewProps> = ({
  trials,
  onOpenDetailModal
}) => {
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [sponsorFilter, setSponsorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = trials.filter((t) => {
    const matchesPhase =
      phaseFilter === 'all' ||
      (t.phase || '').toLowerCase().includes(phaseFilter.toLowerCase());

    const matchesSponsor =
      sponsorFilter === 'all' ||
      (sponsorFilter === 'industry' && t.is_commercial_industry) ||
      (sponsorFilter === 'academic' && !t.is_commercial_industry);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'recruiting' && ['RECRUITING', 'ENROLLING_BY_INVITATION'].includes(t.status)) ||
      (statusFilter === 'completed' && t.status === 'COMPLETED');

    const textToMatch = `${t.title} ${t.official_title} ${t.id} ${t.sponsor} ${(t.interventions || []).join(' ')} ${(t.conditions || []).join(' ')}`.toLowerCase();
    const matchesSearch = !searchQuery.trim() || textToMatch.includes(searchQuery.toLowerCase());

    return matchesPhase && matchesSponsor && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECRUITING':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Recruiting</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Completed
          </span>
        );
      case 'ACTIVE_NOT_RECRUITING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            Active, Not Recruiting
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {status.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  const getPhaseBadge = (phase: string) => {
    if (phase.includes('3')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
          Phase 3 Pivotal
        </span>
      );
    } else if (phase.includes('2')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          Phase 2 Proof of Concept
        </span>
      );
    } else if (phase.includes('1')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-800 border border-purple-200">
          Phase 1 Safety
        </span>
      );
    } else if (phase.includes('4')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200">
          Phase 4 Post-Market
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {phase || 'Observational'}
        </span>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trials by NCT ID, sponsor, drug, condition..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sponsor Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              {[
                { id: 'all', label: 'All Sponsors' },
                { id: 'industry', label: 'Commercial Industry' },
                { id: 'academic', label: 'Academic / NIH' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSponsorFilter(s.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    sponsorFilter === s.id
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="recruiting">Recruiting Now</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Phase Pill Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
          <span className="text-[11px] font-medium text-slate-400 pl-1 pr-1">Phase:</span>
          {[
            { id: 'all', label: 'All Phases' },
            { id: '3', label: 'Phase 3 (Registrational)' },
            { id: '2', label: 'Phase 2' },
            { id: '1', label: 'Phase 1' },
            { id: '4', label: 'Phase 4' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPhaseFilter(p.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                phaseFilter === p.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trial Protocols Grid / Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
            No clinical trial protocols match your current filter criteria.
          </div>
        ) : (
          filtered.map((trial) => (
            <div
              key={trial.id}
              onDoubleClick={() => onOpenDetailModal(trial)}
              className="bg-white rounded-xl border border-slate-200 hover:border-indigo-400 shadow-2xs hover:shadow-xs transition-all duration-150 p-4 sm:p-5 cursor-pointer group"
              title="Double-click to inspect verified clinical trial protocol in-depth"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* NCT Accession */}
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 text-white">
                    {trial.id}
                  </span>

                  {getPhaseBadge(trial.phase)}
                  {getStatusBadge(trial.status)}

                  {/* Vetted Therapeutic Area Badge */}
                  {trial.therapeutic_area && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      {trial.therapeutic_area}
                    </span>
                  )}

                  {/* Vetted Molecule/Product Badge */}
                  {trial.molecule_or_product && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200">
                      {trial.molecule_or_product}
                    </span>
                  )}

                  {/* Commercial Sponsor Classification */}
                  {trial.is_commercial_industry ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center space-x-1">
                      <Building2 className="w-3 h-3 text-emerald-600" />
                      <span>Commercial Biopharma</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center space-x-1">
                      <span>Academic / Investigator</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <span className="text-xs text-slate-500 flex items-center space-x-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{trial.enrollment > 0 ? trial.enrollment.toLocaleString() : 'Target'} pts</span>
                  </span>
                  <a
                    href={trial.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-md hover:bg-slate-100 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Open on ClinicalTrials.gov"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Title */}
              <h4
                onClick={() => onOpenDetailModal(trial)}
                className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer leading-snug mb-2 transition-colors"
              >
                {trial.title}
              </h4>

              {/* Sponsor & Conditions */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mb-3">
                <span>
                  Lead Sponsor: <strong className="text-slate-800">{trial.sponsor}</strong>
                </span>
                {trial.conditions && trial.conditions.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-slate-500">
                      Condition: {trial.conditions.join(', ')}
                    </span>
                  </>
                )}
              </div>

              {/* Interventions & Primary Endpoints Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-3">
                {trial.interventions && trial.interventions.length > 0 && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-1 text-[11px]">
                      Investigational Interventions:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {trial.interventions.map((inv, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 text-[11px] font-mono"
                        >
                          {inv}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {trial.primary_endpoints && trial.primary_endpoints.length > 0 && (
                  <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100">
                    <span className="font-semibold text-blue-900 block mb-1 text-[11px]">
                      Primary Outcome Endpoints:
                    </span>
                    <ul className="space-y-0.5 text-slate-700 text-[11px]">
                      {trial.primary_endpoints.map((ep, idx) => (
                        <li key={idx} className="line-clamp-1">
                          • {ep}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Summary snippet */}
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {trial.summary}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
