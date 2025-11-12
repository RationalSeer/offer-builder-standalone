import { ArrowRight, GitBranch, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { OfferStep } from '../../types/inhouseOffer';

interface FlowDiagramPanelProps {
  steps: OfferStep[];
  onStepClick?: (stepId: string) => void;
}

export function FlowDiagramPanel({ steps, onStepClick }: FlowDiagramPanelProps) {
  function hasConditionalLogic(step: OfferStep): boolean {
    return !!(
      step.conditional_logic?.showIf?.length ||
      step.conditional_logic?.hideIf?.length ||
      step.conditional_logic?.disqualifyIf?.length
    );
  }

  function hasBranching(step: OfferStep): boolean {
    return step.options?.some((opt) => opt.nextStep !== undefined) || false;
  }

  function getStepConnections(step: OfferStep): string[] {
    const connections: string[] = [];

    if (hasBranching(step)) {
      step.options?.forEach((option) => {
        if (typeof option.nextStep === 'number') {
          const targetStep = steps.find((s) => s.step_order === option.nextStep);
          if (targetStep) {
            connections.push(`${option.label} → Step ${option.nextStep + 1}`);
          }
        } else if (option.nextStep === 'submit') {
          connections.push(`${option.label} → Submit`);
        } else if (option.nextStep === 'end') {
          connections.push(`${option.label} → End`);
        }
      });
    }

    return connections;
  }

  if (steps.length === 0) {
    return (
      <div className="p-12 text-center">
        <GitBranch size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
        <p className="text-slate-500 dark:text-slate-400">
          Add steps to see the flow diagram
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
            <p className="font-medium mb-1">Flow Visualization</p>
            <p>
              This diagram shows how users move through your offer, including
              conditional logic and custom branching.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const connections = getStepConnections(step);
          const isConditional = hasConditionalLogic(step);
          const isBranching = hasBranching(step);
          const hasDisqualification =
            step.conditional_logic?.disqualifyIf?.length || 0 > 0;

          return (
            <div key={step.id}>
              <div
                onClick={() => onStepClick?.(step.id)}
                className={`p-4 border-2 rounded-lg transition-all cursor-pointer hover:shadow-md ${
                  isConditional || isBranching
                    ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isConditional || isBranching
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      {step.question_text}
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                        {step.step_type.replace('_', ' ')}
                      </span>

                      {isConditional && (
                        <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded flex items-center gap-1">
                          <AlertCircle size={10} />
                          Conditional
                        </span>
                      )}

                      {isBranching && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded flex items-center gap-1">
                          <GitBranch size={10} />
                          Branching
                        </span>
                      )}

                      {hasDisqualification && (
                        <span className="px-2 py-0.5 text-xs bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded flex items-center gap-1">
                          <XCircle size={10} />
                          Disqualify
                        </span>
                      )}
                    </div>

                    {isConditional && (
                      <div className="mt-2 space-y-1">
                        {step.conditional_logic?.showIf &&
                          step.conditional_logic.showIf.length > 0 && (
                            <div className="flex items-start gap-1.5 text-xs text-green-700 dark:text-green-400">
                              <CheckCircle size={12} className="mt-0.5 flex-shrink-0" />
                              <span>
                                Show if {step.conditional_logic.showIf.length} condition
                                {step.conditional_logic.showIf.length > 1 ? 's' : ''} met
                              </span>
                            </div>
                          )}

                        {step.conditional_logic?.hideIf &&
                          step.conditional_logic.hideIf.length > 0 && (
                            <div className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                              <XCircle size={12} className="mt-0.5 flex-shrink-0" />
                              <span>
                                Hide if {step.conditional_logic.hideIf.length} condition
                                {step.conditional_logic.hideIf.length > 1 ? 's' : ''} met
                              </span>
                            </div>
                          )}

                        {step.conditional_logic?.disqualifyIf &&
                          step.conditional_logic.disqualifyIf.length > 0 && (
                            <div className="flex items-start gap-1.5 text-xs text-rose-700 dark:text-rose-400">
                              <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                              <span>
                                Disqualify if{' '}
                                {step.conditional_logic.disqualifyIf.length} condition
                                {step.conditional_logic.disqualifyIf.length > 1 ? 's' : ''}{' '}
                                met
                              </span>
                            </div>
                          )}
                      </div>
                    )}

                    {connections.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {connections.map((connection, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400"
                          >
                            <ArrowRight size={12} className="flex-shrink-0" />
                            <span>{connection}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight
                    size={20}
                    className="text-slate-300 dark:text-slate-700"
                  />
                </div>
              )}
            </div>
          );
        })}

        <div className="p-4 border-2 border-dashed border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
              <CheckCircle size={18} className="text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">
                Submit Lead
              </h4>
              <p className="text-xs text-green-700 dark:text-green-300">
                Form completed and data sent to buyer
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-medium mb-2">Legend:</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-600"></div>
              <span>Has logic/branching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-600"></div>
              <span>Conditional display</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-600"></div>
              <span>Custom routing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-rose-600"></div>
              <span>Disqualification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
