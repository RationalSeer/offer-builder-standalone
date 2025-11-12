import { useState, useEffect } from 'react';
import {
  Settings,
  Layers,
  Layout,
  Palette,
  Upload,
  ChevronDown,
  ChevronRight,
  Wand2,
  BookOpen,
} from 'lucide-react';

export type PanelMode = 'settings' | 'steps' | 'flow' | 'design' | 'theme' | 'publish' | 'templates';

interface SidebarSection {
  id: string;
  label: string;
  collapsible: boolean;
  panels: {
    id: PanelMode;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

interface CollapsibleSidebarProps {
  activePanel: PanelMode;
  onPanelChange: (panel: PanelMode) => void;
  offerStatus?: string;
  stepCount?: number;
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    id: 'primary',
    label: 'Primary',
    collapsible: false,
    panels: [
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings size={18} />,
      },
      {
        id: 'steps',
        label: 'Steps',
        icon: <Layers size={18} />,
      },
      {
        id: 'templates',
        label: 'Templates',
        icon: <BookOpen size={18} />,
      },
    ],
  },
  {
    id: 'secondary',
    label: 'Design Tools',
    collapsible: true,
    panels: [
      {
        id: 'flow',
        label: 'Flow Diagram',
        icon: <Layout size={18} />,
      },
      {
        id: 'design',
        label: 'Design',
        icon: <Palette size={18} />,
      },
      {
        id: 'theme',
        label: 'Theme',
        icon: <Wand2 size={18} />,
      },
    ],
  },
  {
    id: 'tertiary',
    label: 'Publishing',
    collapsible: false,
    panels: [
      {
        id: 'publish',
        label: 'Publish',
        icon: <Upload size={18} />,
      },
    ],
  },
];

const STORAGE_KEY = 'offer-builder-sidebar-collapsed';

export function CollapsibleSidebar({
  activePanel,
  onPanelChange,
  offerStatus,
  stepCount,
}: CollapsibleSidebarProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(collapsedSections)));
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
    }
  }, [collapsedSections]);

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const getBadgeForPanel = (panelId: PanelMode): string | undefined => {
    if (panelId === 'steps' && stepCount !== undefined) {
      return stepCount.toString();
    }
    if (panelId === 'publish' && offerStatus === 'published') {
      return 'Live';
    }
    return undefined;
  };

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto flex flex-col">
      <div className="flex-1 py-4">
        {SIDEBAR_SECTIONS.map((section) => {
          const isCollapsed = collapsedSections.has(section.id);
          const showCollapse = section.collapsible;

          return (
            <div key={section.id} className="mb-4">
              {showCollapse && (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-4 py-2 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  <span className="uppercase tracking-wide">{section.label}</span>
                  {isCollapsed ? (
                    <ChevronRight size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>
              )}

              {!isCollapsed && (
                <div className="space-y-1 px-2">
                  {section.panels.map((panel) => {
                    const isActive = activePanel === panel.id;
                    const badge = getBadgeForPanel(panel.id);

                    return (
                      <button
                        key={panel.id}
                        onClick={() => onPanelChange(panel.id)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                          ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-sm'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }
                        `}
                      >
                        <span
                          className={`
                            ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}
                          `}
                        >
                          {panel.icon}
                        </span>
                        <span className="flex-1 text-left">{panel.label}</span>
                        {badge && (
                          <span
                            className={`
                              px-2 py-0.5 text-xs rounded-full font-semibold
                              ${
                                isActive
                                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }
                            `}
                          >
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Keyboard Shortcuts</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">?</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Quick Actions</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">Q</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
