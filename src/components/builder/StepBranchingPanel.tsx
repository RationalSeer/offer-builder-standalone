import { GitBranch, ArrowRight, CheckCircle } from 'lucide-react';
import type { OfferStep, StepOption } from '../../types/inhouseOffer';

interface StepBranchingPanelProps {
  currentStep: OfferStep;
  allSteps: OfferStep[];
  onUpdate: (options: StepOption[]) => void;
}

export function StepBranchingPanel({
  currentStep,
  allSteps,
  onUpdate,
}: StepBranchingPanelProps) {
  const hasOptions =
    currentStep.step_type === 'single_choice' ||
    currentStep.step_type === 'multi_choice' ||
    currentStep.step_type === 'yes_no' ||
    currentStep.step_type === 'dropdown';

  const nextSteps = allSteps.filter((s) => s.step_order > currentStep.step_order);

  function updateOptionNextStep(
    optionIndex: number,
    nextStep: number | 'submit' | 'end' | undefined
  ) {
    const newOptions = [...currentStep.options];
    newOptions[optionIndex] = {
      ...newOptions[optionIndex],
      nextStep,
    };
    onUpdate(newOptions);
  }

  if (!hasOptions) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Step branching is only available for choice-based questions.
        </p>
      </div>
    );
  }

  if (currentStep.options.length === 0) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Add options to this step to configure branching.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
        <div className="flex items-start gap-2">
          <GitBranch size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Custom Routing per Answer</p>
            <p>
              Control which step the user sees next based on their selection. Leave
              blank to use default sequential order.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {currentStep.options.map((option, index) => (
          <div
            key={index}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={14} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {option.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowRight
                    size={14}
                    className="text-slate-400 flex-shrink-0"
                  />
                  <select
                    value={option.nextStep?.toString() || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        updateOptionNextStep(index, undefined);
                      } else if (value === 'submit') {
                        updateOptionNextStep(index, 'submit');
                      } else if (value === 'end') {
                        updateOptionNextStep(index, 'end');
                      } else {
                        updateOptionNextStep(index, parseInt(value));
                      }
                    }}
                    className="flex-1 px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Next step (default)</option>
                    <optgroup label="Actions">
                      <option value="submit">Submit form</option>
                      <option value="end">End flow (thank you)</option>
                    </optgroup>
                    {nextSteps.length > 0 && (
                      <optgroup label="Jump to Step">
                        {nextSteps.map((step) => (
                          <option key={step.id} value={step.step_order}>
                            Step {step.step_order + 1}: {step.question_text}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              {option.nextStep && (
                <div className="flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                  Custom
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p>
            <span className="font-medium">Next step (default):</span> Continue to
            the next step in sequence
          </p>
          <p>
            <span className="font-medium">Submit form:</span> Complete the flow and
            submit the lead
          </p>
          <p>
            <span className="font-medium">End flow:</span> End without submitting
            (e.g., thank you page)
          </p>
          <p>
            <span className="font-medium">Jump to Step:</span> Skip to a specific
            step (create non-linear flows)
          </p>
        </div>
      </div>
    </div>
  );
}
