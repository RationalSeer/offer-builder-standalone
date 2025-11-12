import { useEffect, useState } from 'react';
import {
  Plus,
  Copy,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
  Wand2,
  Play,
  Save,
  BarChart,
  Layout,
  Command,
  X,
  CheckCircle,
  GitBranch,
  Layers,
} from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
  tooltip?: string;
}

interface QuickActionsToolbarProps {
  actions: QuickAction[];
  selectedContext?: string;
  onClose?: () => void;
  position?: 'top' | 'bottom' | 'floating';
}

export function QuickActionsToolbar({
  actions,
  selectedContext,
  onClose,
  position = 'floating',
}: QuickActionsToolbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      const isMod = e.metaKey || e.ctrlKey;

      actions.forEach((action) => {
        if (!action.shortcut || action.disabled) return;

        const parts = action.shortcut.toLowerCase().split('+');
        const key = parts[parts.length - 1];
        const needsMod = parts.includes('cmd') || parts.includes('ctrl');
        const needsShift = parts.includes('shift');

        if (
          e.key.toLowerCase() === key &&
          (!needsMod || isMod) &&
          (!needsShift || e.shiftKey)
        ) {
          e.preventDefault();
          action.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-40"
        title="Show Quick Actions (Q)"
      >
        <Command size={20} />
      </button>
    );
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'fixed top-20 left-1/2 -translate-x-1/2';
      case 'bottom':
        return 'fixed bottom-6 left-1/2 -translate-x-1/2';
      case 'floating':
      default:
        return 'fixed bottom-6 right-6';
    }
  };

  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white';
      default:
        return 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className={`${getPositionClasses()} z-40`}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2">
        <div className="flex items-center gap-2 mb-2 px-2 pt-1">
          <div className="flex items-center gap-2 flex-1">
            <Command size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Quick Actions
            </span>
            {selectedContext && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded">
                {selectedContext}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Hide Toolbar (Q)"
          >
            <X size={14} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 max-w-2xl">
          {actions.map((action) => (
            <div key={action.id} className="relative">
              <button
                onClick={action.action}
                disabled={action.disabled}
                onMouseEnter={() => setShowTooltip(action.id)}
                onMouseLeave={() => setShowTooltip(null)}
                className={`
                  group relative px-3 py-2 rounded-lg transition-all text-sm font-medium
                  disabled:opacity-40 disabled:cursor-not-allowed
                  flex items-center gap-2 whitespace-nowrap
                  ${getVariantClasses(action.variant)}
                `}
                title={action.tooltip}
              >
                {action.icon}
                <span className="hidden sm:inline">{action.label}</span>
                {action.shortcut && (
                  <kbd className="hidden md:inline px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-600">
                    {action.shortcut}
                  </kbd>
                )}
              </button>

              {showTooltip === action.id && action.tooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-950 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
                  {action.tooltip}
                  {action.shortcut && (
                    <span className="ml-2 text-slate-400">({action.shortcut})</span>
                  )}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-950" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Press Q to toggle toolbar
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function useQuickActions() {
  const [showToolbar, setShowToolbar] = useState(true);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        setShowToolbar((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return { showToolbar, setShowToolbar };
}

export function getOfferBuilderActions(context: {
  selectedStepId: string | null;
  onAddStep: () => void;
  onDuplicateStep: () => void;
  onDeleteStep: () => void;
  onMoveStepUp: () => void;
  onMoveStepDown: () => void;
  onBrowseTemplates: () => void;
  onPreview: () => void;
  onSave: () => void;
  onTestLogic: () => void;
  onViewAnalytics: () => void;
  onFlowView: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  hasChanges: boolean;
}): QuickAction[] {
  const {
    selectedStepId,
    onAddStep,
    onDuplicateStep,
    onDeleteStep,
    onMoveStepUp,
    onMoveStepDown,
    onBrowseTemplates,
    onPreview,
    onSave,
    onTestLogic,
    onViewAnalytics,
    onFlowView,
    canMoveUp,
    canMoveDown,
    hasChanges,
  } = context;

  const baseActions: QuickAction[] = [
    {
      id: 'add-step',
      label: 'Add Step',
      icon: <Plus size={16} />,
      shortcut: 'Cmd+N',
      action: onAddStep,
      variant: 'primary',
      tooltip: 'Add a new step to your offer',
    },
    {
      id: 'browse-templates',
      label: 'Templates',
      icon: <Wand2 size={16} />,
      shortcut: 'Cmd+T',
      action: onBrowseTemplates,
      tooltip: 'Browse 50+ pre-built step templates',
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: <Eye size={16} />,
      shortcut: 'Cmd+P',
      action: onPreview,
      tooltip: 'Preview your offer as users will see it',
    },
    {
      id: 'save',
      label: hasChanges ? 'Save*' : 'Saved',
      icon: hasChanges ? <Save size={16} /> : <CheckCircle size={16} />,
      shortcut: 'Cmd+S',
      action: onSave,
      disabled: !hasChanges,
      variant: hasChanges ? 'primary' : 'default',
      tooltip: hasChanges ? 'Save your changes' : 'All changes saved',
    },
  ];

  if (selectedStepId) {
    baseActions.push(
      {
        id: 'duplicate',
        label: 'Duplicate',
        icon: <Copy size={16} />,
        shortcut: 'Cmd+D',
        action: onDuplicateStep,
        tooltip: 'Duplicate selected step',
      },
      {
        id: 'move-up',
        label: 'Move Up',
        icon: <ChevronUp size={16} />,
        shortcut: 'Cmd+↑',
        action: onMoveStepUp,
        disabled: !canMoveUp,
        tooltip: 'Move step up in order',
      },
      {
        id: 'move-down',
        label: 'Move Down',
        icon: <ChevronDown size={16} />,
        shortcut: 'Cmd+↓',
        action: onMoveStepDown,
        disabled: !canMoveDown,
        tooltip: 'Move step down in order',
      },
      {
        id: 'test-logic',
        label: 'Test Logic',
        icon: <GitBranch size={16} />,
        shortcut: 'Cmd+L',
        action: onTestLogic,
        tooltip: 'Test conditional logic and branching',
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 size={16} />,
        shortcut: 'Cmd+Backspace',
        action: onDeleteStep,
        variant: 'danger',
        tooltip: 'Delete selected step',
      }
    );
  }

  baseActions.push(
    {
      id: 'flow-view',
      label: 'Flow View',
      icon: <Layers size={16} />,
      shortcut: 'Cmd+F',
      action: onFlowView,
      tooltip: 'View offer flow diagram',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart size={16} />,
      shortcut: 'Cmd+A',
      action: onViewAnalytics,
      tooltip: 'View step performance analytics',
    }
  );

  return baseActions;
}

export function getCampaignActions(context: {
  onDeploy: () => void;
  onTest: () => void;
  onClone: () => void;
  onViewMetrics: () => void;
  onEditCreatives: () => void;
  isDeployed: boolean;
  hasChanges: boolean;
}): QuickAction[] {
  const { onDeploy, onTest, onClone, onViewMetrics, onEditCreatives, isDeployed, hasChanges } = context;

  return [
    {
      id: 'deploy',
      label: isDeployed ? 'Redeploy' : 'Deploy',
      icon: <Play size={16} />,
      shortcut: 'Cmd+Enter',
      action: onDeploy,
      variant: 'primary',
      tooltip: isDeployed ? 'Redeploy campaign with latest changes' : 'Deploy campaign live',
    },
    {
      id: 'test',
      label: 'Test',
      icon: <Eye size={16} />,
      shortcut: 'Cmd+T',
      action: onTest,
      tooltip: 'Test campaign before deploying',
    },
    {
      id: 'clone',
      label: 'Clone',
      icon: <Copy size={16} />,
      shortcut: 'Cmd+D',
      action: onClone,
      tooltip: 'Clone this campaign',
    },
    {
      id: 'metrics',
      label: 'Metrics',
      icon: <BarChart size={16} />,
      shortcut: 'Cmd+M',
      action: onViewMetrics,
      tooltip: 'View campaign metrics',
    },
    {
      id: 'creatives',
      label: 'Creatives',
      icon: <Layout size={16} />,
      shortcut: 'Cmd+C',
      action: onEditCreatives,
      tooltip: 'Edit campaign creatives',
    },
  ];
}
