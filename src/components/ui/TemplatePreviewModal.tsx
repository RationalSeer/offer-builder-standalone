import { useState } from 'react';
import { X, Monitor, Smartphone, CheckCircle, Clock, Award, ArrowRight } from 'lucide-react';
import { WizardTemplate } from '../types/dynamicContent';
import { Button } from './Button';

interface TemplatePreviewModalProps {
  template: WizardTemplate;
  onClose: () => void;
  onUseTemplate?: (template: WizardTemplate) => void;
}

type DeviceMode = 'desktop' | 'mobile';

export function TemplatePreviewModal({ template, onClose, onUseTemplate }: TemplatePreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [currentStep, setCurrentStep] = useState(0);

  const steps = template.suggested_steps || [];
  const stepCount = steps.length;
  const estimatedTime = Math.ceil(stepCount * 15);

  const getFieldIcon = (stepType: string) => {
    const icons: Record<string, string> = {
      text_input: '📝',
      email_input: '✉️',
      phone_input: '📞',
      dropdown: '📋',
      radio_group: '⚪',
      checkbox_group: '☑️',
      date_picker: '📅',
      number_input: '🔢',
      textarea: '📄',
      address: '🏠',
      zip_code: '📮',
    };
    return icons[stepType] || '📝';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{template.name}</h2>
            <p className="text-sm text-muted-foreground">{template.vertical} • {template.goal}</p>
            <p className="text-sm text-muted-foreground mt-2">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 px-6 py-3 bg-secondary/50 border-b text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span><strong>{stepCount}</strong> steps</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-600" />
            <span>~<strong>{estimatedTime}</strong> seconds</span>
          </div>
          {template.popularity_score && template.popularity_score > 0 && (
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Used <strong>{template.popularity_score}</strong> times</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-2 rounded ${deviceMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'hover:bg-secondary'}`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-2 rounded ${deviceMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'hover:bg-secondary'}`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview Panel */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Interactive Preview</h3>
              <div
                className={`bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-8 border-2 border-dashed border-blue-200 dark:border-slate-700 ${
                  deviceMode === 'mobile' ? 'max-w-[375px] mx-auto' : ''
                }`}
              >
                {/* Step Counter */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>Step {currentStep + 1} of {stepCount}</span>
                    <span>{Math.round(((currentStep + 1) / stepCount) * 100)}% Complete</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / stepCount) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Current Step */}
                {steps[currentStep] && (
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="text-3xl">{getFieldIcon(steps[currentStep].step_type)}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">
                          {steps[currentStep].question_text}
                        </h4>
                        {steps[currentStep].help_text && (
                          <p className="text-sm text-muted-foreground">
                            {steps[currentStep].help_text}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Field Representation */}
                    <div className="space-y-3">
                      {steps[currentStep].step_type === 'dropdown' && steps[currentStep].options && (
                        <select className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-700">
                          <option>{steps[currentStep].placeholder_text || 'Select an option...'}</option>
                          {steps[currentStep].options!.map((opt, idx) => (
                            <option key={idx}>{opt.label}</option>
                          ))}
                        </select>
                      )}

                      {steps[currentStep].step_type === 'radio_group' && steps[currentStep].options && (
                        <div className="space-y-2">
                          {steps[currentStep].options!.map((opt, idx) => (
                            <label key={idx} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-secondary cursor-pointer">
                              <input type="radio" name={`step-${currentStep}`} className="w-4 h-4" />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {steps[currentStep].step_type === 'checkbox_group' && steps[currentStep].options && (
                        <div className="space-y-2">
                          {steps[currentStep].options!.map((opt, idx) => (
                            <label key={idx} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-secondary cursor-pointer">
                              <input type="checkbox" className="w-4 h-4" />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {['text_input', 'email_input', 'phone_input', 'number_input', 'zip_code'].includes(steps[currentStep].step_type) && (
                        <input
                          type="text"
                          placeholder={steps[currentStep].placeholder_text || ''}
                          className="w-full px-4 py-3 border rounded-lg"
                          disabled
                        />
                      )}

                      {steps[currentStep].step_type === 'textarea' && (
                        <textarea
                          placeholder={steps[currentStep].placeholder_text || ''}
                          rows={4}
                          className="w-full px-4 py-3 border rounded-lg"
                          disabled
                        />
                      )}

                      {steps[currentStep].step_type === 'date_picker' && (
                        <input
                          type="date"
                          className="w-full px-4 py-3 border rounded-lg"
                          disabled
                        />
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <button
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => setCurrentStep(Math.min(stepCount - 1, currentStep + 1))}
                        disabled={currentStep === stepCount - 1}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {currentStep === stepCount - 1 ? 'Submit' : 'Next'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step Navigator */}
              <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
                {steps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`flex-shrink-0 px-3 py-1 text-xs rounded-full transition-colors ${
                      idx === currentStep
                        ? 'bg-blue-600 text-white'
                        : idx < currentStep
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {idx + 1}. {step.question_text?.substring(0, 20)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Steps List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">All Steps Included</h3>
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-4 border rounded-lg transition-colors ${
                      idx === currentStep ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-600 text-white text-xs rounded-full">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{step.question_text}</h4>
                          <span className="text-xs text-muted-foreground">
                            {getFieldIcon(step.step_type)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Type: {step.step_type.replace(/_/g, ' ')}
                        </p>
                        {step.validation_rules?.required && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                            Required
                          </span>
                        )}
                        {step.options && step.options.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {step.options.length} options available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-secondary/30">
          <div className="text-sm text-muted-foreground">
            💡 This template can be fully customized in the builder
          </div>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
            {onUseTemplate && (
              <Button onClick={() => onUseTemplate(template)}>
                Use This Template
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
