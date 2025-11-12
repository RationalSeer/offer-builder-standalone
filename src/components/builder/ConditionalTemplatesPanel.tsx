import { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import {
  conditionalTemplates,
} from '../../data/conditionalTemplates';
import type { ConditionalTemplate } from '../../data/conditionalTemplates';
import type { OfferStep } from '../../types/inhouseOffer';

interface ConditionalTemplatesPanelProps {
  currentStep: OfferStep;
  allSteps: OfferStep[];
  onApplyTemplate: (template: ConditionalTemplate) => void;
}

export function ConditionalTemplatesPanel({
  onApplyTemplate,
}: ConditionalTemplatesPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'qualification' | 'routing' | 'disqualification'
  >('all');

  const allTemplates = Object.values(conditionalTemplates).flat();
  const filteredTemplates =
    selectedCategory === 'all'
      ? allTemplates
      : allTemplates.filter((t: ConditionalTemplate) => t.category === selectedCategory);

  const categoryColors = {
    qualification: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    routing: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
    disqualification:
      'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg">
        <div className="flex items-start gap-2">
          <Sparkles size={16} className="text-purple-600 dark:text-purple-400 mt-0.5" />
          <div className="text-xs text-purple-700 dark:text-purple-300">
            <p className="font-medium mb-1">Quick Start Templates</p>
            <p>
              Apply pre-built conditional logic patterns for common use cases. You can
              customize after applying.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          All Templates
        </button>
        <button
          onClick={() => setSelectedCategory('qualification')}
          className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'qualification'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Qualification
        </button>
        <button
          onClick={() => setSelectedCategory('routing')}
          className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'routing'
              ? 'bg-green-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Routing
        </button>
        <button
          onClick={() => setSelectedCategory('disqualification')}
          className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'disqualification'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Disqualification
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto">
        {filteredTemplates.map((template: ConditionalTemplate) => (
          <div
            key={template.id}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="text-2xl">{template.icon}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {template.name}
                  </h4>
                  <span
                    className={`px-2 py-0.5 text-xs rounded whitespace-nowrap ${
                      categoryColors[template.category as keyof typeof categoryColors]
                    }`}
                  >
                    {template.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  {template.description}
                </p>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs text-slate-700 dark:text-slate-300 mb-3">
                  <span className="font-medium">Example: </span>
                  {template.example}
                </div>
              </div>
            </div>

            <button
              onClick={() => onApplyTemplate(template)}
              className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={14} />
              Apply Template
            </button>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No templates found in this category
          </p>
        </div>
      )}

      <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          <span className="font-medium">Note:</span> After applying a template, you'll
          need to select which previous step to reference. The logic will be added to
          your current step and can be customized further.
        </p>
      </div>
    </div>
  );
}
