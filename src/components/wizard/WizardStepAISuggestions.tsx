import { useState } from 'react';
import { Sparkles, Check, Loader } from 'lucide-react';
import type { OfferStep } from '../../types/inhouseOffer';

interface WizardStepAISuggestionsProps {
  vertical: string;
  goal: string;
  templateSteps?: any[];
  useAI: boolean;
  onUseAIChange: (useAI: boolean) => void;
  onGenerateSuggestions?: () => Promise<OfferStep[]>;
}

export function WizardStepAISuggestions({
  vertical,
  goal,
  templateSteps,
  useAI,
  onUseAIChange,
  onGenerateSuggestions,
}: WizardStepAISuggestionsProps) {
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<OfferStep[]>([]);

  async function handleGenerate() {
    if (!onGenerateSuggestions) return;

    try {
      setGenerating(true);
      const generatedSteps = await onGenerateSuggestions();
      setSuggestions(generatedSteps);
      onUseAIChange(true);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setGenerating(false);
    }
  }

  const stepCount = templateSteps?.length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          AI Optimization
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Let AI suggest the optimal step sequence for your offer
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => onUseAIChange(false)}
          className={`
            p-6 rounded-xl border-2 text-left transition-all
            ${
              !useAI
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg'
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
            }
          `}
        >
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Use Template As-Is
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Start with the template's {stepCount} steps and customize later
              </p>
            </div>
            {!useAI && (
              <Check size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
            )}
          </div>
        </button>

        <button
          onClick={() => onUseAIChange(true)}
          className={`
            p-6 rounded-xl border-2 text-left transition-all
            ${
              useAI
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
                  useAI ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                }
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  AI-Optimized Sequence
                </h3>
                <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded">
                  Recommended
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                AI will analyze your vertical and goal to suggest the best step order for maximum conversions
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-600 dark:text-green-400" />
                  Optimized question order
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-600 dark:text-green-400" />
                  Better engagement flow
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-600 dark:text-green-400" />
                  Higher completion rates
                </li>
              </ul>
            </div>
            {useAI && (
              <Check size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
            )}
          </div>
        </button>
      </div>

      {useAI && onGenerateSuggestions && (
        <div className="mt-6">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader size={20} className="animate-spin" />
                Generating AI Suggestions...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate AI Suggestions
              </>
            )}
          </button>

          {suggestions.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    AI Suggestions Generated
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {suggestions.length} optimized steps ready. Continue to customize your design.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Pro Tip:</strong> AI optimization analyzes thousands of high-converting funnels
          to suggest the best question order for your {vertical} {goal.replace('_', ' ')} offer.
        </p>
      </div>
    </div>
  );
}
