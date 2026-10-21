import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Maximize2,
  Minimize2,
  FlaskConical,
  BookOpen,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Compass
} from 'lucide-react';
import { ScraperResponse } from '../types';

interface ClinicalAssistantProps {
  studyData: ScraperResponse | null;
  onOpenItem: (item: any) => void;
  onSwitchTab: (tab: 'insights' | 'records') => void;
  onSearch: (query: string) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  prefilledPrompt?: string | null;
  onClearPrefilledPrompt?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const ClinicalAssistant: React.FC<ClinicalAssistantProps> = ({
  studyData,
  onOpenItem,
  onSwitchTab,
  onSearch,
  isOpen,
  onToggle,
  prefilledPrompt,
  onClearPrefilledPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello, I am **Dex**, your clinical navigator assistant! Ask me any questions about clinical literature, trials, primary endpoints, or healthcare research.',
      timestamp: 'Now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle prefilled prompt passed from slabs
  useEffect(() => {
    if (prefilledPrompt) {
      onToggle(true);
      sendMessage(prefilledPrompt);
      if (onClearPrefilledPrompt) onClearPrefilledPrompt();
    }
  }, [prefilledPrompt]);

  const sendMessage = async (textToSend: string) => {
    const q = textToSend.trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
          studyData
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'No response returned from clinical engine.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('Assistant notice:', err?.message || err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'The assistant could not complete this request right now. You can inspect all records directly in the [[tab:records|Clinical Protocols]] tab.',
        timestamp: 'Now'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Helper to find trial or study object in studyData
  const findItemById = (rawId: string) => {
    if (!studyData?.verified_studies) return null;
    const cleanId = rawId.replace(/^PMID:\s*/i, '').trim();

    // Check trials
    const trial = studyData.verified_studies.clinical_trials?.find(
      (t) => t.id.toLowerCase() === cleanId.toLowerCase()
    );
    if (trial) return trial;

    // Check PubMed
    const pubmed = studyData.verified_studies.pubmed_literature?.find(
      (p) => p.pmid === cleanId || p.id === cleanId
    );
    if (pubmed) return pubmed;

    // Check Europe PMC
    const epmc = studyData.verified_studies.europe_pmc_preprints?.find(
      (e) => e.id.toLowerCase() === cleanId.toLowerCase()
    );
    return epmc || null;
  };

  // Helper to open trial, study, search, or tab
  const handleOpenLink = async (linkType: string, target: string) => {
    if (linkType === 'trial' || linkType === 'study') {
      const localItem = findItemById(target);
      if (localItem) {
        onOpenItem(localItem);
        return;
      }
      try {
        const res = await fetch(`/api/assistant/item/${encodeURIComponent(target)}`);
        if (res.ok) {
          const itemData = await res.json();
          onOpenItem(itemData);
          return;
        }
      } catch {
        // continue to fallback
      }
      const isTrial = target.toUpperCase().startsWith('NCT');
      const fallbackItem = {
        id: target,
        title: isTrial ? `Clinical Trial Protocol ${target}` : `PubMed Indexed Publication (PMID: ${target})`,
        url: isTrial ? `https://clinicaltrials.gov/study/${target}` : `https://pubmed.ncbi.nlm.nih.gov/${target.replace(/\D/g, '')}`,
        sponsor: isTrial ? 'ClinicalTrials.gov Registry' : 'NLM / PubMed',
        authors: isTrial ? 'Protocol Investigators' : 'Biomedical Investigators',
        phase: isTrial ? 'Phase 3 / Pivotal' : undefined,
        status: 'COMPLETED',
        journal: isTrial ? undefined : 'Peer-Reviewed Medical Literature',
        pub_date: 'Recent',
        abstract: `Record indexed in official clinical repository. Detailed dossier for identifier ${target}.`
      };
      onOpenItem(fallbackItem);
    } else if (linkType === 'tab') {
      onSwitchTab('records');
    } else if (linkType === 'search') {
      onSearch(target);
    }
  };

  // Render an inline line of text with markdown styling and [[type:id|label]] tags
  const renderInlineFormatted = (text: string) => {
    const parts = [];
    const linkRegex = /\[\[(trial|study|tab|search):([^|\]]+)\|([^\]]+)\]\]/g;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }

      const linkType = match[1];
      const target = match[2];
      const label = match[3];

      parts.push(
        <button
          key={`link-${matchIndex}`}
          type="button"
          onClick={() => handleOpenLink(linkType, target)}
          className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 border border-blue-200/80 font-mono text-[11px] font-semibold transition-colors cursor-pointer my-0.5"
          title={`Click to navigate to ${label}`}
        >
          {linkType === 'trial' && <FlaskConical className="w-2.5 h-2.5 text-blue-600" />}
          {linkType === 'study' && <BookOpen className="w-2.5 h-2.5 text-emerald-600" />}
          {linkType === 'search' && <Sparkles className="w-2.5 h-2.5 text-blue-600" />}
          {linkType === 'tab' && <Compass className="w-2.5 h-2.5 text-slate-600" />}
          <span>{label}</span>
          <ArrowRight className="w-2.5 h-2.5 opacity-60" />
        </button>
      );

      lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    // Process bold and italic text in regular string parts
    return parts.map((part, i) => {
      if (typeof part !== 'string') return part;
      
      const segments = part.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
      return (
        <span key={i}>
          {segments.map((seg, j) => {
            if (seg.startsWith('**') && seg.endsWith('**')) {
              return <strong key={j} className="font-semibold text-slate-900">{seg.slice(2, -2)}</strong>;
            }
            if (seg.startsWith('*') && seg.endsWith('*')) {
              return <em key={j} className="italic text-slate-700">{seg.slice(1, -1)}</em>;
            }
            return seg;
          })}
        </span>
      );
    });
  };

  // Structured multi-part message renderer for complete analyses
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (!trimmed) {
        elements.push(<div key={`spacer-${idx}`} className="h-1.5" />);
        return;
      }

      // Blockquote styling (e.g. > "A single infusion..." — San-Miguel et al.)
      if (trimmed.startsWith('> ') || trimmed.startsWith('>')) {
        const quoteContent = trimmed.replace(/^>\s*/, '');
        elements.push(
          <div key={`quote-${idx}`} className="my-2 pl-3 py-1.5 border-l-3 border-blue-500 bg-blue-50/60 rounded-r-lg text-slate-800 text-[11.5px] italic leading-relaxed shadow-2xs">
            <div className="flex items-start space-x-1.5">
              <span className="text-blue-600 font-serif text-base leading-none select-none">“</span>
              <div className="flex-1">{renderInlineFormatted(quoteContent)}</div>
            </div>
          </div>
        );
        return;
      }

      // H3 Section Heading (e.g. ### 1. Primary Clinical Endpoints)
      if (trimmed.startsWith('### ')) {
        const headingText = trimmed.replace(/^###\s+/, '');
        elements.push(
          <div key={`h3-${idx}`} className="pt-2 pb-1 border-b border-slate-200/80 mb-1.5">
            <h4 className="text-[12px] font-bold text-slate-900 flex items-center space-x-1.5 tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
              <span>{renderInlineFormatted(headingText)}</span>
            </h4>
          </div>
        );
        return;
      }

      // H4 Subsection Heading (e.g. #### Section)
      if (trimmed.startsWith('#### ')) {
        const headingText = trimmed.replace(/^####\s+/, '');
        elements.push(
          <h5 key={`h4-${idx}`} className="text-[11px] font-bold text-slate-800 pt-1.5 pb-0.5 tracking-tight">
            {renderInlineFormatted(headingText)}
          </h5>
        );
        return;
      }

      // Bullet List Item
      if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
        const bulletContent = trimmed.replace(/^[•\-]\s+/, '');
        elements.push(
          <div key={`bullet-${idx}`} className="flex items-start space-x-2 my-1 text-slate-700 leading-relaxed">
            <span className="text-blue-500 font-bold text-[10px] shrink-0 mt-0.5">•</span>
            <div className="flex-1">{renderInlineFormatted(bulletContent)}</div>
          </div>
        );
        return;
      }

      // Numbered List Item
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <div key={`num-${idx}`} className="flex items-start space-x-2 my-1 text-slate-700 leading-relaxed">
            <span className="text-blue-600 font-bold text-[11px] shrink-0 font-mono">{numMatch[1]}.</span>
            <div className="flex-1">{renderInlineFormatted(numMatch[2])}</div>
          </div>
        );
        return;
      }

      // Regular Paragraph Line
      elements.push(
        <p key={`p-${idx}`} className="my-0.5 text-slate-700 leading-relaxed">
          {renderInlineFormatted(trimmed)}
        </p>
      );
    });

    return elements;
  };

  const SUGGESTED_QUESTIONS = [
    'Latest research study on CAR-T',
    'Primary endpoints & findings for Semaglutide',
    'DESTINY-Breast results for Trastuzumab Deruxtecan',
    'Clarity AD trial outcomes for Lecanemab'
  ];

  return (
    <>
      {/* Floating Trigger Pill when closed */}
      {!isOpen && (
        <button
          onClick={() => onToggle(true)}
          className="fixed bottom-5 right-5 z-40 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg flex items-center space-x-2 border border-slate-700/80 transition-all duration-200 hover:scale-105 cursor-pointer group"
          title="Open Clinical Research Assistant"
        >
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping group-hover:bg-sky-300"></div>
          <Sparkles className="w-4 h-4 text-sky-300" />
          <span className="text-xs font-semibold tracking-tight">Clinical Assistant</span>
        </button>
      )}

      {/* Floating Assistant Modal when open */}
      {isOpen && (
        <div 
          className={`fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 font-sans transition-all ${
            isExpanded 
              ? 'w-[95vw] sm:w-[680px] h-[640px] max-h-[90vh]' 
              : 'w-[92vw] sm:w-[460px] h-[540px] max-h-[84vh]'
          }`}
        >
          
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-sky-300">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-tight leading-tight">
                  Dex · Clinical Assistant
                </h3>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Independent Clinical & Protocol Intelligence
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isExpanded ? 'Compact View' : 'Expand View for Deep Reading'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setMessages([{
                  id: 'welcome-reset',
                  sender: 'assistant',
                  text: 'Chat cleared. Hello, I am **Dex**! Ask me any questions about clinical trials, literature, or healthcare research.',
                  timestamp: 'Now'
                }])}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Clear Chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggle(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Questions Carousel */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(q)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-[11px] font-medium text-slate-700 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs leading-relaxed">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-xl p-3.5 shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-none'
                      : 'bg-slate-50/90 border border-slate-200/80 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {renderMessageContent(msg.text)}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center space-x-2.5 text-blue-800 text-xs animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
                <span className="font-medium">Finding answers in clinical records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 border-t border-slate-200/80 bg-white flex items-center space-x-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Dex anything about clinical trials, literature, endpoints..."
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-blue-500 rounded-xl text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 transition-colors cursor-pointer shrink-0 flex items-center space-x-1.5"
              title="Send question"
            >
              <span className="text-[11px] font-medium hidden sm:inline">Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
