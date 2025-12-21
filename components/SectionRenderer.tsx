'use client';

import { forwardRef, useState } from 'react';
import { Section, ActionItem } from '@/lib/types';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  ListTodo,
  Users,
  MessageSquare,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface SectionRendererProps {
  section: Section;
  isActive?: boolean;
}

interface ActionItemCardProps {
  item: ActionItem;
}

function ActionItemCard({ item }: ActionItemCardProps) {
  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-gray-200 bg-gray-50',
  };

  const priority = item.priority || 'medium';

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${priorityColors[priority]}`}>
      <div className="mt-0.5">
        <ListTodo className="w-4 h-4 text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800">{item.task}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
          {item.owner && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {item.owner}
            </span>
          )}
          {item.dueDate && (
            <span>{item.dueDate}</span>
          )}
          {item.priority && (
            <span className={`
              px-1.5 py-0.5 rounded text-xs font-medium
              ${priority === 'high' ? 'bg-red-100 text-red-700' : ''}
              ${priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
              ${priority === 'low' ? 'bg-gray-100 text-gray-600' : ''}
            `}>
              {priority}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const SectionRenderer = forwardRef<HTMLDivElement, SectionRendererProps>(
  function SectionRenderer({ section, isActive }, ref) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [copiedPoint, setCopiedPoint] = useState<number | null>(null);

    const hasContent = section.content || 
      section.metadata.keyPoints.length > 0 || 
      section.metadata.decisions.length > 0 ||
      section.metadata.actionItems.length > 0;

    const hasSubsections = section.subsections && section.subsections.length > 0;

    const copyToClipboard = async (text: string, index: number) => {
      await navigator.clipboard.writeText(text);
      setCopiedPoint(index);
      setTimeout(() => setCopiedPoint(null), 2000);
    };

    // Heading size based on level
    const headingClasses = {
      2: 'text-xl font-bold text-gray-900',
      3: 'text-lg font-semibold text-gray-800',
      4: 'text-base font-medium text-gray-700',
    };

    return (
      <div
        ref={ref}
        id={section.id}
        className={`
          scroll-mt-24 transition-all duration-200
          ${isActive ? 'bg-blue-50/30 rounded-lg -mx-2 px-2' : ''}
        `}
      >
        {/* Section Header */}
        <div className="flex items-start gap-2 mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <div className="flex-1">
            <h2 className={headingClasses[section.level]}>
              {section.heading}
            </h2>
            {section.metadata.speakers.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                <Users className="w-3.5 h-3.5" />
                <span>{section.metadata.speakers.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {isExpanded && hasContent && (
          <div className="pl-7 space-y-4">
            {/* Main Content */}
            {section.content && (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">{section.content}</p>
              </div>
            )}

            {/* Key Points */}
            {section.metadata.keyPoints.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <MessageSquare className="w-4 h-4" />
                  Key Points
                </h4>
                <ul className="space-y-2">
                  {section.metadata.keyPoints.map((point, index) => (
                    <li 
                      key={index}
                      className="flex items-start gap-2 group"
                    >
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      <span className="flex-1 text-gray-700">{point}</span>
                      <button
                        onClick={() => copyToClipboard(point, index)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                        title="Copy"
                      >
                        {copiedPoint === index ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Decisions */}
            {section.metadata.decisions.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  Decisions Made
                </h4>
                <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                  <ul className="space-y-2">
                    {section.metadata.decisions.map((decision, index) => (
                      <li 
                        key={index}
                        className="flex items-start gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-green-800">{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Action Items */}
            {section.metadata.actionItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-medium text-orange-700">
                  <ListTodo className="w-4 h-4" />
                  Action Items
                </h4>
                <div className="space-y-2">
                  {section.metadata.actionItems.map((item, index) => (
                    <ActionItemCard key={index} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subsections */}
        {hasSubsections && isExpanded && (
          <div className="pl-6 mt-6 space-y-6 border-l-2 border-gray-100">
            {section.subsections!.map((subsection) => (
              <SectionRenderer
                key={subsection.id}
                section={subsection}
              />
            ))}
          </div>
        )}

        {/* Collapsed Preview */}
        {!isExpanded && (hasContent || hasSubsections) && (
          <div className="pl-7 py-2 text-sm text-gray-500 italic">
            {section.metadata.keyPoints.length > 0 && (
              <span>{section.metadata.keyPoints.length} points</span>
            )}
            {section.metadata.actionItems.length > 0 && (
              <span className="ml-2">• {section.metadata.actionItems.length} actions</span>
            )}
            {hasSubsections && (
              <span className="ml-2">• {section.subsections!.length} subtopics</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

export default SectionRenderer;

