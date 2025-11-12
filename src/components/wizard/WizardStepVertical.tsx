import { useState, useEffect } from 'react';
import {
  GraduationCap, Shield, DollarSign, Heart, Building, TrendingUp,
  Briefcase, Home, Scale, TrendingDown, Stethoscope, Truck,
  Activity, Users, AlertCircle
} from 'lucide-react';
import { getWizardTemplates } from '../../services/wizardTemplateService';

interface WizardStepVerticalProps {
  selectedVertical?: string;
  selectedGoal?: 'lead_gen' | 'qualification' | 'survey' | 'quiz';
  onVerticalChange: (vertical: string) => void;
  onGoalChange: (goal: 'lead_gen' | 'qualification' | 'survey' | 'quiz') => void;
}

interface VerticalOption {
  value: string;
  label: string;
  icon: any;
  description: string;
  templateCount: number;
  goals: ('lead_gen' | 'qualification')[];
}

const VERTICAL_ICONS: Record<string, any> = {
  'EDU': GraduationCap,
  'Education': GraduationCap,
  'SSD': Shield,
  'Auto Insurance': Shield,
  'Home Insurance': Home,
  'Life Insurance': Heart,
  'Personal Loans': DollarSign,
  'Solar': TrendingUp,
  'Debt Relief': TrendingDown,
  'Medicare': Stethoscope,
  'Home Services': Home,
  'Legal Services': Scale,
  'Moving Services': Truck,
  'Weight Loss': Activity,
  'Senior Care': Users,
  'Business Services': Briefcase,
};

const GOAL_OPTIONS = [
  {
    value: 'lead_gen' as const,
    label: 'Lead Generation',
    description: 'Capture contact information for sales follow-up',
    recommended: true,
  },
  {
    value: 'qualification' as const,
    label: 'Lead Qualification',
    description: 'Pre-qualify leads before passing to buyers',
    recommended: false,
  },
];

export function WizardStepVertical({
  selectedVertical,
  selectedGoal,
  onVerticalChange,
  onGoalChange,
}: WizardStepVerticalProps) {
  const [verticals, setVerticals] = useState<VerticalOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVerticals();
  }, []);

  async function loadVerticals() {
    try {
      setLoading(true);
      setError(null);
      const templates = await getWizardTemplates();

      const verticalMap = new Map<string, VerticalOption>();

      templates.forEach(template => {
        const existing = verticalMap.get(template.vertical);
        if (existing) {
          existing.templateCount++;
          if (!existing.goals.includes(template.goal)) {
            existing.goals.push(template.goal);
          }
        } else {
          verticalMap.set(template.vertical, {
            value: template.vertical,
            label: template.vertical,
            icon: VERTICAL_ICONS[template.vertical] || Building,
            description: template.description?.substring(0, 50) || 'Lead generation templates',
            templateCount: 1,
            goals: [template.goal],
          });
        }
      });

      const sortedVerticals = Array.from(verticalMap.values())
        .sort((a, b) => b.templateCount - a.templateCount);

      setVerticals(sortedVerticals);
    } catch (err) {
      console.error('Failed to load verticals:', err);
      setError('Unable to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const availableGoals = selectedVertical
    ? verticals.find(v => v.value === selectedVertical)?.goals || []
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-slate-600 dark:text-slate-400">Loading templates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={loadVerticals}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Choose Your Industry
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Select from {verticals.length} industries with ready-to-use templates
        </p>
      </div>

      {verticals.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {verticals.map((vertical) => {
            const Icon = vertical.icon;
            const isSelected = selectedVertical === vertical.value;

            return (
              <button
                key={vertical.value}
                onClick={() => onVerticalChange(vertical.value)}
                className={`
                  p-6 rounded-xl border-2 text-left transition-all
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon
                    size={32}
                    className={`${
                      isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded">
                    {vertical.templateCount} {vertical.templateCount === 1 ? 'template' : 'templates'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  {vertical.label}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {vertical.description}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No templates available yet.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Check back soon or start from scratch.
          </p>
        </div>
      )}

      {selectedVertical && availableGoals.length > 0 && (
        <>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              What's Your Goal?
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Choose what you want to achieve with this offer
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {GOAL_OPTIONS.filter(goal => availableGoals.includes(goal.value)).map((goal) => {
              const isSelected = selectedGoal === goal.value;

              return (
                <button
                  key={goal.value}
                  onClick={() => onGoalChange(goal.value)}
                  className={`
                    p-6 rounded-xl border-2 text-left transition-all relative
                    ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }
                  `}
                >
                  {goal.recommended && (
                    <span className="absolute top-4 right-4 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                      Recommended
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {goal.label}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {goal.description}
                  </p>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
