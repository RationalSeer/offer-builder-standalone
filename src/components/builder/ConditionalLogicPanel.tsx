import { Plus, Trash2, AlertCircle, GitBranch, X } from 'lucide-react';
import type { OfferStep, ConditionalRule, ConditionalLogic } from '../../types/inhouseOffer';

interface ConditionalLogicPanelProps {
  currentStep: OfferStep;
  allSteps: OfferStep[];
  onUpdate: (logic: ConditionalLogic) => void;
}

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
];

export function ConditionalLogicPanel({
  currentStep,
  allSteps,
  onUpdate,
}: ConditionalLogicPanelProps) {
  const logic = currentStep.conditional_logic || {};
  const previousSteps = allSteps.filter(
    (s) => s.step_order < currentStep.step_order
  );

  function addRule(type: 'showIf' | 'hideIf' | 'disqualifyIf') {
    const newRule: ConditionalRule = {
      stepId: previousSteps[0]?.id || '',
      operator: 'equals',
      value: '',
    };

    const existingRules = logic[type] || [];
    onUpdate({
      ...logic,
      [type]: [...existingRules, newRule],
    });
  }

  function updateRule(
    type: 'showIf' | 'hideIf' | 'disqualifyIf',
    index: number,
    updates: Partial<ConditionalRule>
  ) {
    const rules = [...(logic[type] || [])];
    rules[index] = { ...rules[index], ...updates };
    onUpdate({
      ...logic,
      [type]: rules,
    });
  }

  function removeRule(type: 'showIf' | 'hideIf' | 'disqualifyIf', index: number) {
    const rules = [...(logic[type] || [])];
    rules.splice(index, 1);
    onUpdate({
      ...logic,
      [type]: rules,
    });
  }

  function updateOperator(operator: 'AND' | 'OR') {
    onUpdate({
      ...logic,
      operator,
    });
  }

  function updateDisqualifyRedirect(url: string) {
    onUpdate({
      ...logic,
      disqualifyRedirectUrl: url,
    });
  }

  function renderRuleBuilder(
    type: 'showIf' | 'hideIf' | 'disqualifyIf',
    rules: ConditionalRule[] = []
  ) {
    if (rules.length === 0) return null;

    return (
      <div className="space-y-2">
        {rules.map((rule, index) => {
          const selectedStep = allSteps.find((s) => s.id === rule.stepId);

          return (
            <div
              key={index}
              className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1 space-y-2">
                  <select
                    value={rule.stepId}
                    onChange={(e) =>
                      updateRule(type, index, { stepId: e.target.value })
                    }
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Select step...</option>
                    {previousSteps.map((step) => (
                      <option key={step.id} value={step.id}>
                        Step {step.step_order + 1}: {step.question_text}
                      </option>
                    ))}
                  </select>

                  <select
                    value={rule.operator}
                    onChange={(e) =>
                      updateRule(type, index, { operator: e.target.value as any })
                    }
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {OPERATORS.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>

                  {selectedStep && selectedStep.options.length > 0 ? (
                    <select
                      value={rule.value}
                      onChange={(e) =>
                        updateRule(type, index, { value: e.target.value })
                      }
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">Select value...</option>
                      {selectedStep.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) =>
                        updateRule(type, index, { value: e.target.value })
                      }
                      placeholder="Enter value..."
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  )}
                </div>

                <button
                  onClick={() => removeRule(type, index)}
                  className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {index < rules.length - 1 && (
                <div className="flex items-center justify-center mt-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateOperator('AND')}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        logic.operator === 'AND'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      AND
                    </button>
                    <button
                      onClick={() => updateOperator('OR')}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        logic.operator === 'OR'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      OR
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (previousSteps.length === 0) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-slate-400 mt-0.5" />
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Conditional logic requires at least one previous step.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Add more steps to enable conditional routing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-slate-600 dark:text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Show This Step If...
            </h4>
          </div>
          <button
            onClick={() => addRule('showIf')}
            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
          >
            <Plus size={12} />
            Add Rule
          </button>
        </div>

        {renderRuleBuilder('showIf', logic.showIf)}

        {(!logic.showIf || logic.showIf.length === 0) && (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            No conditions set. Step will always be shown.
          </p>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <X size={16} className="text-slate-600 dark:text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Hide This Step If...
            </h4>
          </div>
          <button
            onClick={() => addRule('hideIf')}
            className="px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors flex items-center gap-1"
          >
            <Plus size={12} />
            Add Rule
          </button>
        </div>

        {renderRuleBuilder('hideIf', logic.hideIf)}

        {(!logic.hideIf || logic.hideIf.length === 0) && (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            No conditions set. Step will not be hidden.
          </p>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 dark:text-rose-400" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Disqualify Lead If...
            </h4>
          </div>
          <button
            onClick={() => addRule('disqualifyIf')}
            className="px-2 py-1 text-xs bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors flex items-center gap-1"
          >
            <Plus size={12} />
            Add Rule
          </button>
        </div>

        {renderRuleBuilder('disqualifyIf', logic.disqualifyIf)}

        {logic.disqualifyIf && logic.disqualifyIf.length > 0 && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Redirect URL (on disqualification)
            </label>
            <input
              type="url"
              value={logic.disqualifyRedirectUrl || ''}
              onChange={(e) => updateDisqualifyRedirect(e.target.value)}
              placeholder="https://example.com/sorry"
              className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Users will be redirected here if they are disqualified
            </p>
          </div>
        )}

        {(!logic.disqualifyIf || logic.disqualifyIf.length === 0) && (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            No disqualification rules set.
          </p>
        )}
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle size={14} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Show/Hide rules control step visibility</li>
              <li>Disqualification stops the funnel and redirects</li>
              <li>Use AND for all conditions to match</li>
              <li>Use OR for any condition to match</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
