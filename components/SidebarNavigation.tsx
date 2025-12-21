'use client';

import { useState, useCallback } from 'react';
import { Section, MeetingContext } from '@/lib/types';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Users,
  Hash,
  CheckCircle,
  ListTodo,
  Clock,
} from 'lucide-react';

interface SidebarNavigationProps {
  title: string;
  context: MeetingContext;
  sections: Section[];
  activeSection: string | null;
  onSectionClick: (sectionId: string) => void;
  totalActionItems: number;
  totalDecisions: number;
}

interface NavItemProps {
  section: Section;
  depth: number;
  activeSection: string | null;
  onSectionClick: (sectionId: string) => void;
  expandedSections: Set<string>;
  toggleExpanded: (sectionId: string) => void;
}

function NavItem({
  section,
  depth,
  activeSection,
  onSectionClick,
  expandedSections,
  toggleExpanded,
}: NavItemProps) {
  const hasChildren = section.subsections && section.subsections.length > 0;
  const isExpanded = expandedSections.has(section.id);
  const isActive = activeSection === section.id;

  const handleClick = () => {
    onSectionClick(section.id);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpanded(section.id);
  };

  // Calculate indentation based on depth
  const paddingLeft = 12 + depth * 16;

  return (
    <div>
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center gap-2 py-2 px-3 text-left text-sm
          transition-all duration-150 rounded-md mx-1
          ${isActive 
            ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-500' 
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {hasChildren ? (
          <span 
            onClick={handleToggle}
            className="flex-shrink-0 p-0.5 hover:bg-gray-200 rounded cursor-pointer"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            )}
          </span>
        ) : (
          <span className="w-4" />
        )}
        <Hash className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
        <span className="truncate">{section.heading}</span>
        {section.metadata.actionItems.length > 0 && (
          <span className="ml-auto flex-shrink-0 bg-orange-100 text-orange-600 text-xs px-1.5 py-0.5 rounded">
            {section.metadata.actionItems.length}
          </span>
        )}
      </button>
      
      {hasChildren && isExpanded && (
        <div>
          {section.subsections!.map((subsection) => (
            <NavItem
              key={subsection.id}
              section={subsection}
              depth={depth + 1}
              activeSection={activeSection}
              onSectionClick={onSectionClick}
              expandedSections={expandedSections}
              toggleExpanded={toggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SidebarNavigation({
  title,
  context,
  sections,
  activeSection,
  onSectionClick,
  totalActionItems,
  totalDecisions,
}: SidebarNavigationProps) {
  // Start with all sections expanded by default
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const expanded = new Set<string>();
    const collectIds = (secs: Section[]) => {
      for (const s of secs) {
        expanded.add(s.id);
        if (s.subsections) {
          collectIds(s.subsections);
        }
      }
    };
    collectIds(sections);
    return expanded;
  });

  const toggleExpanded = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const expandAll = () => {
    const expanded = new Set<string>();
    const collectIds = (secs: Section[]) => {
      for (const s of secs) {
        expanded.add(s.id);
        if (s.subsections) {
          collectIds(s.subsections);
        }
      }
    };
    collectIds(sections);
    setExpandedSections(expanded);
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h1 className="font-semibold text-gray-900 text-lg leading-tight truncate">
          {title}
        </h1>
        {context.date && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{context.date}</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Users className="w-3.5 h-3.5" />
            <span>{context.participants.length || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-600">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{totalDecisions}</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-600">
            <ListTodo className="w-3.5 h-3.5" />
            <span>{totalActionItems}</span>
          </div>
        </div>
      </div>

      {/* Context Section */}
      <div className="px-3 py-2 border-b border-gray-200">
        <button
          onClick={() => onSectionClick('context')}
          className={`
            w-full flex items-center gap-2 py-2 px-3 text-left text-sm rounded-md
            ${activeSection === 'context' 
              ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-500' 
              : 'text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          <FileText className={`w-4 h-4 ${activeSection === 'context' ? 'text-blue-500' : 'text-gray-400'}`} />
          <span>Meeting Context</span>
        </button>
      </div>

      {/* Sections Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-4 mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Topics
          </span>
          <div className="flex gap-1">
            <button
              onClick={expandAll}
              className="text-xs text-gray-400 hover:text-gray-600 px-1"
              title="Expand all"
            >
              +
            </button>
            <button
              onClick={collapseAll}
              className="text-xs text-gray-400 hover:text-gray-600 px-1"
              title="Collapse all"
            >
              −
            </button>
          </div>
        </div>
        
        <nav>
          {sections.map((section) => (
            <NavItem
              key={section.id}
              section={section}
              depth={0}
              activeSection={activeSection}
              onSectionClick={onSectionClick}
              expandedSections={expandedSections}
              toggleExpanded={toggleExpanded}
            />
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-white text-xs text-gray-400 text-center">
        Generated by AI • Review and edit as needed
      </div>
    </div>
  );
}

