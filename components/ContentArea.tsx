'use client';

import { useRef, useEffect } from 'react';
import { MeetingContext, Section, MeetingMetadata } from '@/lib/types';
import SectionRenderer from './SectionRenderer';
import {
  Users,
  Target,
  BookOpen,
  Clock,
  Brain,
  ListTodo,
  CheckCircle,
  FileText,
  Download,
  Share2,
} from 'lucide-react';

interface ContentAreaProps {
  title: string;
  context: MeetingContext;
  sections: Section[];
  metadata: MeetingMetadata;
  activeSection: string | null;
  onSectionVisible: (sectionId: string) => void;
}

interface ContextSectionProps {
  context: MeetingContext;
  isActive: boolean;
}

function ContextSection({ context, isActive }: ContextSectionProps) {
  return (
    <div
      id="context"
      className={`
        scroll-mt-24 p-6 rounded-xl border transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' 
          : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
        }
      `}
    >
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
        <BookOpen className="w-5 h-5 text-blue-500" />
        Meeting Context
      </h2>

      <div className="space-y-4">
        {/* Purpose */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
            <Target className="w-4 h-4" />
            Purpose
          </h3>
          <p className="text-gray-800 leading-relaxed">{context.purpose}</p>
        </div>

        {/* Participants */}
        {context.participants.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
              <Users className="w-4 h-4" />
              Participants
            </h3>
            <div className="flex flex-wrap gap-2">
              {context.participants.map((participant, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-800">{participant.name}</span>
                    {participant.role && (
                      <span className="text-gray-500 ml-1">• {participant.role}</span>
                    )}
                    {participant.organization && (
                      <span className="text-gray-400 ml-1">({participant.organization})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Background */}
        {context.background && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
              <FileText className="w-4 h-4" />
              Background
            </h3>
            <p className="text-gray-700 leading-relaxed">{context.background}</p>
          </div>
        )}

        {/* Date & Duration */}
        {(context.date || context.duration) && (
          <div className="flex gap-4 text-sm text-gray-600">
            {context.date && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {context.date}
              </span>
            )}
            {context.duration && (
              <span>{context.duration}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MetadataBarProps {
  metadata: MeetingMetadata;
}

function MetadataBar({ metadata }: MetadataBarProps) {
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

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-100 mb-6">
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
          <Brain className="w-3.5 h-3.5" />
          {getMeetingTypeLabel(metadata.meetingType)}
        </span>
        <span className="flex items-center gap-1.5 text-gray-600">
          <Clock className="w-3.5 h-3.5" />
          {metadata.totalDuration}
        </span>
        <span className="flex items-center gap-1.5 text-green-600">
          <CheckCircle className="w-3.5 h-3.5" />
          {metadata.totalDecisions} decisions
        </span>
        <span className="flex items-center gap-1.5 text-orange-600">
          <ListTodo className="w-3.5 h-3.5" />
          {metadata.totalActionItems} actions
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button 
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Export"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ContentArea({
  title,
  context,
  sections,
  metadata,
  activeSection,
  onSectionVisible,
}: ContentAreaProps) {
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Set up intersection observer for scroll tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onSectionVisible(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      }
    );

    sectionRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections, onSectionVisible]);

  const registerRef = (id: string, element: HTMLDivElement | null) => {
    if (element) {
      sectionRefs.current.set(id, element);
    } else {
      sectionRefs.current.delete(id);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-6">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h1>
        
        {/* Metadata Bar */}
        <MetadataBar metadata={metadata} />

        {/* Context Section */}
        <div ref={(el) => registerRef('context', el)}>
          <ContextSection 
            context={context} 
            isActive={activeSection === 'context'}
          />
        </div>

        {/* Main Sections */}
        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <div
              key={section.id}
              ref={(el) => registerRef(section.id, el)}
            >
              <SectionRenderer
                section={section}
                isActive={activeSection === section.id}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Generated by Meet PA AI • {new Date(metadata.generatedAt).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {metadata.totalSections} sections • Processed using {metadata.processingStrategy.replace('_', '-')} strategy
          </p>
        </div>
      </div>
    </div>
  );
}

