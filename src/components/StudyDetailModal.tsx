import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Award, 
  Building2, 
  Users, 
  Calendar, 
  FileText,
  Bookmark
} from 'lucide-react';

interface StudyDetailModalProps {
  item: any | null;
  onClose: () => void;
}

export const StudyDetailModal: React.FC<StudyDetailModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const isTrial = item.id && item.id.startsWith('NCT');
  const evidence = item.evidence_hierarchy || { level: item.evidence_tier || 'Level 2', tier: 'Clinical Trial', badge: 'Verified Evidence' };

  const handleCopyCitation = () => {
    let citation = '';
    if (isTrial) {
      citation = `ClinicalTrials.gov Protocol ${item.id}: ${item.title}. Sponsor: ${item.sponsor}. Status: ${item.status}. URL: ${item.url}`;
    } else {
      citation = `${item.authors || 'Investigators'} (${item.pub_date || item.pub_year || 'Recent'}). ${item.title}. ${item.journal || 'Journal'}.${item.doi ? ' DOI: ' + item.doi : ''}`;
    }
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="space-y-1.5 pr-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 text-white">
                {item.id}
              </span>
              {item.therapeutic_area && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  {item.therapeutic_area}
                </span>
              )}
              {item.molecule_or_product && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200">
                  {item.molecule_or_product}
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {isTrial ? item.phase || 'Clinical Protocol' : evidence.level + ': ' + evidence.tier}
              </span>
              {isTrial && item.is_commercial_industry && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Commercial Biopharma
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {item.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Source / Repository</span>
              <span className="font-semibold text-slate-800">{isTrial ? 'ClinicalTrials.gov v2' : item.journal || 'PubMed / NCBI'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">{isTrial ? 'Lead Sponsor' : 'Authors'}</span>
              <span className="font-semibold text-slate-800 truncate block">{isTrial ? item.sponsor : item.authors}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">{isTrial ? 'Status / Phase' : 'Pub Date'}</span>
              <span className="font-semibold text-slate-800">{isTrial ? `${item.status} (${item.phase})` : item.pub_date || item.pub_year}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">{isTrial ? 'Enrollment' : 'Identifier'}</span>
              <span className="font-semibold text-slate-800">{isTrial ? `${item.enrollment || 0} patients` : item.doi ? 'DOI Available' : item.pmid ? `PMID: ${item.pmid}` : 'Indexed'}</span>
            </div>
          </div>

          {/* Interventions & Primary Endpoints if trial */}
          {isTrial && (
            <div className="space-y-3">
              {item.interventions && item.interventions.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Investigational Interventions & Drug Regimens</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {item.interventions.map((inv: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-900 font-mono text-[11px]">
                        {inv}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.primary_endpoints && item.primary_endpoints.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Primary Outcome Measures (Clinical Endpoints)</h4>
                  <ul className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {item.primary_endpoints.map((ep: string, idx: number) => (
                      <li key={idx} className="text-slate-800 flex items-start space-x-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{ep}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Abstract / Description */}
          <div>
            <h4 className="font-bold text-slate-900 mb-1.5">
              {isTrial ? 'Detailed Protocol Brief Summary' : 'Structured Abstract & Clinical Findings'}
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed text-slate-700">
              {item.abstract || item.summary || 'Full text record available via official repository link below.'}
            </div>
          </div>

          {/* Epistemic Provenance Footer */}
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between text-[11px]">
            <span className="text-blue-900 font-medium">
              Data Provenance: {item.data_provenance || 'Public Biomedical Repository'}
            </span>
            <span className="text-slate-500 font-mono">
              Scraped via LumiDex Python Engine
            </span>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleCopyCitation}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy Citation / Reference'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              <span>View Authoritative Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
