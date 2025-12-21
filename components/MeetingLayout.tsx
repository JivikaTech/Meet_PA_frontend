'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { MeetingStructure } from '@/lib/types';
import SidebarNavigation from './SidebarNavigation';
import ContentArea from './ContentArea';
import {
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

interface MeetingLayoutProps {
  structure: MeetingStructure;
}

export default function MeetingLayout({ structure }: MeetingLayoutProps) {
  const [activeSection, setActiveSection] = useState<string | null>('context');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle section click from sidebar
  const handleSectionClick = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    
    // Scroll to section
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Handle section visibility change from scroll
  const handleSectionVisible = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div 
        className={`
          transition-all duration-300 ease-in-out relative
          ${sidebarCollapsed ? 'w-0' : 'w-72'}
        `}
      >
        {!sidebarCollapsed && (
          <SidebarNavigation
            title={structure.title}
            context={structure.context}
            sections={structure.sections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
            totalActionItems={structure.metadata.totalActionItems}
            totalDecisions={structure.metadata.totalDecisions}
          />
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`
          absolute z-10 p-2 bg-white border border-gray-200 rounded-lg shadow-sm
          hover:bg-gray-50 transition-all duration-200
          ${sidebarCollapsed ? 'left-3' : 'left-[276px]'}
          top-4
        `}
        title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
      >
        {sidebarCollapsed ? (
          <PanelLeft className="w-4 h-4 text-gray-500" />
        ) : (
          <PanelLeftClose className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Content Area */}
      <div ref={contentRef} className="flex-1 overflow-hidden">
        <ContentArea
          title={structure.title}
          context={structure.context}
          sections={structure.sections}
          metadata={structure.metadata}
          activeSection={activeSection}
          onSectionVisible={handleSectionVisible}
        />
      </div>
    </div>
  );
}

