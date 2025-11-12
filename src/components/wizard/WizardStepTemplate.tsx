import { useState, useEffect } from 'react';
import { Check, Sparkles, FileText, TrendingUp } from 'lucide-react';
import type { WizardTemplate } from '../../types/dynamicContent';
import { getWizardTemplates } from '../../services/wizardTemplateService';

interface WizardStepTemplateProps {
  vertical: string;
  goal: 'lead_gen' | 'qualification' | 'survey' | 'quiz';
  selectedTemplate?: WizardTemplate;
  onTemplateChange: (template: WizardTemplate | null) => void;
}

export function WizardStepTemplate({
  vertical,
  goal,
  selectedTemplate,
  onTemplateChange,
}: WizardStepTemplateProps) {
  const [templates, setTemplates] = useState<WizardTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, [vertical, goal]);

  async function loadTemplates() {
    try {
      setLoading(true);
      const allTemplates = await getWizardTemplates(vertical, goal);
      const filteredTemplates = allTemplates.filter(t => t.goal === goal);
      setTemplates(filteredTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Choose a Template
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Start with a proven template or build from scratch
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => onTemplateChange(null)}
            className={`
              p-6 rounded-xl border-2 text-left transition-all
              ${
                !selectedTemplate
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Sparkles
                  size={32}
                  className={
                    !selectedTemplate
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  Start from Scratch
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Build your offer step-by-step with complete control
                </p>
              </div>
              {!selectedTemplate && (
                <Check size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
              )}
            </div>
          </button>

          {templates.map((template) => {
            const isSelected = selectedTemplate?.id === template.id;
            const stepCount = template.suggested_steps?.length || 0;

            return (
              <button
                key={template.id}
                onClick={() => onTemplateChange(template)}
                className={`
                  p-6 rounded-xl border-2 text-left transition-all
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <FileText
                      size={32}
                      className={
                        isSelected
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {template.name}
                      </h3>
                      {template.popularity_score > 80 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs font-semibold rounded">
                          <TrendingUp size={12} />
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>{stepCount} steps</span>
                      <span>•</span>
                      <span>Optimized for {goal.replace('_', ' ')}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {templates.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            No templates available for this vertical and goal.
            <br />
            Start from scratch to create your offer.
          </p>
        </div>
      )}
    </div>
  );
}
