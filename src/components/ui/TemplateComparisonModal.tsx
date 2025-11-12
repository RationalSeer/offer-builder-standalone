import { X, CheckCircle, Clock, Award, TrendingUp, ArrowRight } from 'lucide-react';
import type { WizardTemplate } from '../../types/dynamicContent';
import { Button } from './Button';

interface TemplateComparisonModalProps {
  templates: WizardTemplate[];
  onClose: () => void;
  onSelectTemplate?: (template: WizardTemplate) => void;
}

export function TemplateComparisonModal({ templates, onClose, onSelectTemplate }: TemplateComparisonModalProps) {
  if (templates.length < 2) {
    return null;
  }

  const maxSteps = Math.max(...templates.map(t => t.suggested_steps?.length || 0));

  const getStepComparison = (stepIndex: number) => {
    return templates.map(template => {
      const steps = template.suggested_steps || [];
      return steps[stepIndex] || null;
    });
  };

  const verticalIcons: Record<string, string> = {
    'EDU': '🎓',
    'Education': '🎓',
    'SSD': '🛡️',
    'Solar': '☀️',
    'Insurance': '🚗',
    'Auto Insurance': '🚗',
    'Home Insurance': '🏠',
    'Life Insurance': '💰',
    'Health Insurance': '🏥',
    'Finance': '💵',
    'Loans': '💵',
    'Mortgage': '🏡',
    'Debt': '💳',
    'Home Services': '🔧',
    'Medicare': '🏥',
    'Business': '💼',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Compare Templates</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Side-by-side comparison of {templates.length} templates
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Template Headers */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${templates.length}, minmax(0, 1fr))` }}>
            {templates.map(template => (
              <div key={template.id} className="bg-card border-2 rounded-lg p-6">
                <div className="text-center mb-4">
                  <span className="text-5xl">{verticalIcons[template.vertical] || '📄'}</span>
                </div>
                <h3 className="text-xl font-bold text-center mb-2">{template.name}</h3>
                <p className="text-sm text-blue-600 text-center mb-3">{template.vertical}</p>
                <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2">
                  {template.description}
                </p>

                {template.popularity_score && template.popularity_score > 50 && (
                  <div className="flex justify-center mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                      <TrendingUp className="w-3 h-3" />
                      Popular
                    </span>
                  </div>
                )}

                {onSelectTemplate && (
                  <Button onClick={() => onSelectTemplate(template)} className="w-full">
                    Select This One
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="bg-card border rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                {/* Step Count */}
                <tr className="border-b">
                  <td className="p-4 font-semibold bg-secondary/50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      Number of Steps
                    </div>
                  </td>
                  {templates.map(template => (
                    <td key={template.id} className="p-4 text-center">
                      <span className="font-bold text-lg">
                        {template.suggested_steps?.length || 0}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Estimated Time */}
                <tr className="border-b">
                  <td className="p-4 font-semibold bg-secondary/50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      Completion Time
                    </div>
                  </td>
                  {templates.map(template => {
                    const stepCount = template.suggested_steps?.length || 0;
                    const estimatedTime = Math.ceil(stepCount * 15);
                    return (
                      <td key={template.id} className="p-4 text-center">
                        <span className="font-medium">~{estimatedTime}s</span>
                      </td>
                    );
                  })}
                </tr>

                {/* Usage Count */}
                <tr className="border-b">
                  <td className="p-4 font-semibold bg-secondary/50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-600" />
                      Times Used
                    </div>
                  </td>
                  {templates.map(template => (
                    <td key={template.id} className="p-4 text-center">
                      <span className="font-medium">
                        {template.popularity_score || 0}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Goal */}
                <tr className="border-b">
                  <td className="p-4 font-semibold bg-secondary/50 sticky left-0 z-10">
                    Goal Type
                  </td>
                  {templates.map(template => (
                    <td key={template.id} className="p-4 text-center">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {template.goal.replace(/_/g, ' ')}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Step-by-Step Comparison */}
                <tr>
                  <td colSpan={templates.length + 1} className="p-4 bg-secondary/30">
                    <h4 className="font-bold text-lg">Step-by-Step Breakdown</h4>
                  </td>
                </tr>

                {Array.from({ length: maxSteps }).map((_, stepIndex) => {
                  const stepComparison = getStepComparison(stepIndex);
                  const hasAllSteps = stepComparison.every(step => step !== null);

                  return (
                    <tr key={stepIndex} className={`border-b ${!hasAllSteps ? 'bg-gray-50 dark:bg-slate-900/50' : ''}`}>
                      <td className="p-4 font-semibold bg-secondary/50 sticky left-0 z-10">
                        Step {stepIndex + 1}
                      </td>
                      {stepComparison.map((step, idx) => (
                        <td key={idx} className="p-4 align-top">
                          {step ? (
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{step.question_text}</div>
                              <div className="text-xs text-muted-foreground">
                                Type: {step.step_type.replace(/_/g, ' ')}
                              </div>
                              {step.validation_rules?.required && (
                                <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                                  Required
                                </span>
                              )}
                              {step.options && step.options.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {step.options.length} options
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground italic">
                              No step at this position
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}

                {/* Key Differences */}
                <tr>
                  <td colSpan={templates.length + 1} className="p-4 bg-secondary/30">
                    <h4 className="font-bold text-lg mb-3">Key Differences</h4>
                    <div className="space-y-2">
                      {/* Length Difference */}
                      {templates.some(t => (t.suggested_steps?.length || 0) !== templates[0].suggested_steps?.length) && (
                        <div className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            <strong>Length:</strong> Templates vary in number of steps (
                            {templates.map(t => t.suggested_steps?.length || 0).join(', ')} steps)
                          </span>
                        </div>
                      )}

                      {/* Goal Difference */}
                      {templates.some(t => t.goal !== templates[0].goal) && (
                        <div className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            <strong>Purpose:</strong> Different goals (
                            {Array.from(new Set(templates.map(t => t.goal))).join(', ')})
                          </span>
                        </div>
                      )}

                      {/* Popularity Difference */}
                      {templates.some(t => (t.popularity_score || 0) > 50) && (
                        <div className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            <strong>Popularity:</strong> Some templates are more battle-tested than others
                          </span>
                        </div>
                      )}

                      {/* Vertical Difference */}
                      {templates.some(t => t.vertical !== templates[0].vertical) && (
                        <div className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            <strong>Industry:</strong> Templates are optimized for different verticals (
                            {Array.from(new Set(templates.map(t => t.vertical))).join(', ')})
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Recommendations */}
                <tr>
                  <td colSpan={templates.length + 1} className="p-4 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div className="flex-1">
                        <h4 className="font-bold mb-2">Quick Recommendations</h4>
                        <ul className="space-y-1 text-sm">
                          {templates.some(t => (t.popularity_score || 0) > 100) && (
                            <li>• Consider the most popular template if you're new to lead generation</li>
                          )}
                          <li>• Shorter templates (fewer steps) typically have higher completion rates</li>
                          <li>• All templates can be fully customized after selection</li>
                          <li>• You can switch templates later without losing your data</li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-secondary/30">
          <div className="text-sm text-muted-foreground">
            💡 All templates can be fully customized in the builder
          </div>
          <Button onClick={onClose}>
            Close Comparison
          </Button>
        </div>
      </div>
    </div>
  );
}
