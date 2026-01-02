'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SummaryResponse, EnhancedSummaryResponse, Section, ActionItem } from '@/lib/types';
import { 
  FileText, 
  List, 
  CheckCircle, 
  ListTodo, 
  Sparkles,
  Users,
  Target,
  BookOpen,
  Clock,
  Brain,
  Lightbulb,
  AlertCircle,
  TrendingUp,
  User,
  Quote
} from 'lucide-react';

interface SummaryPanelProps {
  summary?: SummaryResponse;
  enhancedSummary?: EnhancedSummaryResponse;
  transcript?: string;
}

// Reference tooltip component with fixed positioning to avoid clipping
function TranscriptReference({ refId, transcript }: { refId: number; transcript?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Deterministic excerpt based on reference id (sequential chunking)
  const getTranscriptExcerpt = () => {
    if (!transcript) return 'Transcript not available';

    const words = transcript.split(/\s+/).filter(Boolean);
    const chunkSize = 60; // approx. ~60 words per reference
    const startIndex = Math.max(0, (refId - 1) * chunkSize);
    const endIndex = Math.min(words.length, startIndex + chunkSize + 30); // little overlap

    if (startIndex >= words.length) return 'Transcript reference not available for this section.';
    const text = words.slice(startIndex, endIndex).join(' ');
    return `${text}${endIndex < words.length ? ' ...' : ''}`;
  };

  const handleMouseEnter = () => {
    const tooltipWidth = 400;
    const tooltipHeight = 300;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = (viewportWidth - tooltipWidth) / 2;
    let top = (viewportHeight - tooltipHeight) / 2;

    left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, viewportHeight - tooltipHeight - 16));

    setPosition({ top, left });
    setIsVisible(true);
  };

  return (
    <>
      <button
        onMouseEnter={handleMouseEnter}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors relative z-10"
      >
        {refId}
      </button>
      
      {isVisible && typeof window !== 'undefined' && createPortal(
        <>
          {/* Backdrop overlay - closes only on click */} 
          <div
            className="fixed inset-0 bg-black/30 z-[99998]"
            onClick={() => setIsVisible(false)}
            style={{ zIndex: 99998 }}
          />
          {/* Tooltip centered */}
          <div
            className="fixed w-[400px] h-[300px] overflow-y-auto p-6 bg-slate-800 text-slate-100 rounded-xl shadow-2xl border-2 border-slate-600 pointer-events-auto"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              zIndex: 99999,
            }}
            onMouseEnter={(e) => {
              e.stopPropagation();
              setIsVisible(true);
            }}
            onMouseLeave={() => setIsVisible(false)}
          >
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-200 border-b border-slate-700 pb-3">
              <Quote className="w-4 h-4" />
              <span>Reference {refId}</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-200 mb-4">
              {getTranscriptExcerpt()}
            </p>
            <div className="pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-400 italic">Click backdrop to close</p>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

// Modern enhanced summary view
function EnhancedSummaryView({ enhancedSummary, transcript }: { enhancedSummary: EnhancedSummaryResponse; transcript?: string }) {
  const { structure } = enhancedSummary;
  const { context, sections, metadata } = structure;

  const getMeetingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      interview: 'Interview',
      standup: 'Standup',
      planning: 'Planning',
      review: 'Review',
      customer_call: 'Customer Call',
      brainstorm: 'Brainstorm',
      one_on_one: '1:1 Meeting',
      general: 'Meeting',
    };
    return labels[type] || 'Meeting';
  };

  const getSectionIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('decision')) return CheckCircle;
    if (lower.includes('action') || lower.includes('next step')) return ListTodo;
    if (lower.includes('discussion') || lower.includes('topic')) return List;
    if (lower.includes('insight') || lower.includes('key')) return Lightbulb;
    if (lower.includes('concern') || lower.includes('risk') || lower.includes('issue')) return AlertCircle;
    if (lower.includes('outcome') || lower.includes('result')) return TrendingUp;
    return FileText;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeInUp">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-900/5 overflow-hidden stagger-item">
        <div className="bg-gradient-to-r from-slate-900 to-slate-400 px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 backdrop-blur-sm text-white text-xs font-medium mb-3 border border-white/20">
                <Brain className="w-3.5 h-3.5" />
                {getMeetingTypeLabel(metadata.meetingType)}
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{structure.title}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {metadata.totalDuration}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  {metadata.totalDecisions} decisions
                </span>
                <span className="flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4" />
                  {metadata.totalActionItems} actions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Context */}
        <div className="p-8 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Meeting Context</h2>
          </div>

          <div className="space-y-5">
            {/* Purpose */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Target className="w-4 h-4" />
                Purpose
              </div>
              <p className="text-slate-900 leading-relaxed text-sm">{context.purpose}</p>
            </div>

            {/* Participants */}
            {context.participants.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Users className="w-4 h-4" />
                  Participants ({context.participants.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {context.participants.map((participant, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-semibold">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-slate-900">{participant.name}</div>
                        {participant.role && (
                          <div className="text-xs text-slate-500">{participant.role}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Background */}
            {context.background && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FileText className="w-4 h-4" />
                  Background
                </div>
                <p className="text-slate-700 leading-relaxed text-sm">{context.background}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {sections.map((section, index) => {
          const IconComponent = getSectionIcon(section.heading);
          const decisions = section.metadata.decisions || [];
          const actionItems = section.metadata.actionItems || [];
          const keyPoints = section.metadata.keyPoints || [];
          // Reference counter: each section and its items get incremental reference ids
          const baseRef = index * 10 + 1; // each section block gets a range of ids
          
          return (
            <div
              key={section.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition-all stagger-item"
              style={{ animationDelay: `${(index + 2) * 0.1}s` }}
            >
              <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{section.heading}</h3>
                  </div>
                  <TranscriptReference refId={baseRef} transcript={transcript} />
                </div>
              </div>

              <div className="p-6">
                {/* Main Content */}
                {section.content && (
                  <div className="mb-5 bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-slate-800 leading-relaxed text-sm">{section.content}</p>
                  </div>
                )}

                {/* Key Points */}
                {keyPoints.length > 0 && (
                  <div className="space-y-2.5 mb-5">
                    {keyPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0 group-hover:bg-slate-600" />
                        <div className="flex-1 flex items-start justify-between gap-3">
                          <p className="text-slate-700 leading-relaxed text-sm flex-1">{point}</p>
                          <TranscriptReference refId={baseRef + idx + 1} transcript={transcript} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Decisions */}
                {decisions.length > 0 && (
                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Decisions ({decisions.length})</span>
                    </div>
                    {decisions.map((decision, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 hover:border-green-300 hover:bg-green-100 transition-all"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 flex items-start justify-between gap-3">
                          <p className="text-slate-900 leading-relaxed text-sm flex-1">{decision}</p>
                          <TranscriptReference refId={baseRef + keyPoints.length + idx + 1} transcript={transcript} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Items */}
                {actionItems.length > 0 && (
                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <ListTodo className="w-4 h-4 text-blue-600" />
                      <span>Action Items ({actionItems.length})</span>
                    </div>
                    {actionItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 hover:border-blue-300 hover:bg-blue-100 transition-all"
                      >
                        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-slate-900 leading-relaxed text-sm flex-1">{item.task}</p>
                            <TranscriptReference refId={baseRef + keyPoints.length + decisions.length + idx + 1} transcript={transcript} />
                          </div>
                          {item.owner && (
                            <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-md border border-slate-200 inline-flex">
                              <User className="w-3.5 h-3.5" />
                              <span className="font-medium">{item.owner}</span>
                              {item.dueDate && (
                                <>
                                  <span className="text-slate-300">|</span>
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{item.dueDate}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subsections */}
                {section.subsections && section.subsections.length > 0 && (
                  <div className="mt-5 pl-4 border-l-2 border-slate-300 space-y-4">
                    {section.subsections.map((subsection) => (
                      <div key={subsection.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <h4 className="font-semibold text-slate-800 mb-2 text-sm">{subsection.heading}</h4>
                        <p className="text-slate-700 leading-relaxed text-sm">{subsection.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-600 mb-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Generated by Meet PA AI</span>
        </div>
        <p className="text-xs text-slate-500">
          {new Date(metadata.generatedAt).toLocaleString()} • {metadata.totalSections} sections • {metadata.processingStrategy.replace('_', ' ')}
        </p>
      </div>
    </div>
  );
}

// Modern basic summary view
function BasicSummaryView({ summary, transcript }: { summary: SummaryResponse; transcript?: string }) {
  const sections = [
    {
      id: 'tldr',
      title: 'Summary',
      icon: FileText,
      content: summary.tldr,
      color: 'slate',
      isList: false,
    },
    {
      id: 'key_points',
      title: 'Key Points',
      icon: List,
      content: summary.key_points,
      color: 'slate',
      isList: true,
    },
    {
      id: 'decisions',
      title: 'Decisions',
      icon: CheckCircle,
      content: summary.decisions,
      color: 'green',
      isList: true,
    },
    {
      id: 'action_items',
      title: 'Action Items',
      icon: ListTodo,
      content: summary.action_items,
      color: 'blue',
      isList: true,
    },
  ];

  const getRefId = (sectionIdx: number, itemIdx: number) => {
    // Generate unique reference ID: each section gets base 10, items increment
    return sectionIdx * 10 + itemIdx + 1;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fadeInUp">
      {sections.map((section, sectionIdx) => {
          const Icon = section.icon;
        const hasContent = section.isList 
          ? (section.content as string[]).length > 0 
          : (section.content as string).trim().length > 0;

          return (
            <div
              key={section.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition-all stagger-item"
            style={{ animationDelay: `${sectionIdx * 0.1}s` }}
          >
            <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                </div>
              </div>

            <div className="p-6">
              {!hasContent ? (
                <p className="text-slate-500 italic text-center py-4 text-sm">No {section.title.toLowerCase()} found</p>
              ) : section.isList ? (
                <div className="space-y-2.5">
                  {(section.content as string[]).map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all ${
                        section.id === 'decisions' 
                          ? 'bg-green-50 border-green-200 hover:border-green-300 hover:bg-green-100' 
                          : section.id === 'action_items'
                          ? 'bg-blue-50 border-blue-200 hover:border-blue-300 hover:bg-blue-100'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {section.id === 'decisions' && (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      )}
                      {section.id === 'action_items' && (
                        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                          {itemIdx + 1}
                        </div>
                      )}
                      {section.id === 'key_points' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                      )}
                      <div className="flex-1 flex items-start justify-between gap-3">
                        <p className="text-slate-800 leading-relaxed flex-1 text-sm">{item}</p>
                        <TranscriptReference refId={getRefId(sectionIdx, itemIdx)} transcript={transcript} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-slate-800 leading-relaxed text-sm">{section.content as string}</p>
                </div>
              )}
            </div>
            </div>
          );
        })}

      {/* Footer */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-600">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Generated by Meet PA AI</span>
      </div>
      </div>
    </div>
  );
}

export default function SummaryPanel({ summary, enhancedSummary, transcript }: SummaryPanelProps) {
  // If we have enhanced summary, use the modern enhanced view
  if (enhancedSummary) {
    return <EnhancedSummaryView enhancedSummary={enhancedSummary} transcript={transcript} />;
  }

  // Fall back to modern basic view if only simple summary is provided
  if (summary) {
    return <BasicSummaryView summary={summary} transcript={transcript} />;
  }

  // No summary available
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 p-12 text-center shadow-lg">
      <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">No Summary Available</h3>
      <p className="text-slate-600 text-sm">Upload or record audio to generate a meeting summary.</p>
    </div>
  );
}
