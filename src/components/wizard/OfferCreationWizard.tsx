import { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import type { WizardState, WizardTemplate } from '../../types/dynamicContent';
import { WizardStepVertical } from './WizardStepVertical';
import { WizardStepTemplate } from './WizardStepTemplate';
import { WizardStepAISuggestions } from './WizardStepAISuggestions';
import { WizardStepDesign } from './WizardStepDesign';
import { WizardStepRouting } from './WizardStepRouting';
import type { InhouseOffer, OfferStep } from '../../types/inhouseOffer';
import { incrementTemplateUsage } from '../../services/wizardTemplateService';

interface OfferCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (offerData: Partial<InhouseOffer>, steps: OfferStep[]) => void;
  onSkipToBuilder?: () => void;
}

const STEPS = [
  { id: 1, label: 'Industry & Goal' },
  { id: 2, label: 'Template' },
  { id: 3, label: 'AI Optimization' },
  { id: 4, label: 'Design' },
  { id: 5, label: 'Routing' },
];

const STORAGE_KEY = 'offer_wizard_state';

export function OfferCreationWizard({ isOpen, onClose, onComplete, onSkipToBuilder }: OfferCreationWizardProps) {
  const [wizardState, setWizardState] = useState<WizardState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored
        ? JSON.parse(stored)
        : {
            step: 1,
            useAI: false,
            design: {
              primaryColor: '#3b82f6',
              backgroundColor: '#ffffff',
              fontFamily: 'Inter, sans-serif',
            },
            routing: {},
          };
    } catch {
      return {
        step: 1,
        useAI: false,
        design: {
          primaryColor: '#3b82f6',
          backgroundColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
        },
        routing: {},
      };
    }
  });

  function updateWizardState(updates: Partial<WizardState>) {
    const newState = { ...wizardState, ...updates };
    setWizardState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save wizard state:', error);
    }
  }

  function canProceed(): boolean {
    switch (wizardState.step) {
      case 1:
        return !!wizardState.vertical && !!wizardState.goal;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return !!wizardState.design?.primaryColor;
      case 5:
        return true;
      default:
        return false;
    }
  }

  function handleNext() {
    if (canProceed() && wizardState.step < STEPS.length) {
      updateWizardState({ step: wizardState.step + 1 });
    }
  }

  function handleBack() {
    if (wizardState.step > 1) {
      updateWizardState({ step: wizardState.step - 1 });
    }
  }

  async function handleComplete() {
    const steps: OfferStep[] = (wizardState.template?.suggested_steps || []).map((step: any, index: number) => ({
      id: `temp-${Date.now()}-${index}`,
      offer_id: '',
      step_order: index,
      step_type: step.step_type || 'text_input',
      question_text: step.question_text || 'Question',
      help_text: step.help_text || '',
      placeholder_text: step.placeholder_text || '',
      field_mapping: step.field_mapping || `field_${index}`,
      options: step.options || [],
      validation_rules: step.validation_rules || {},
      conditional_logic: step.conditional_logic || {},
      step_layout: step.step_layout || 'centered',
      animation_type: step.animation_type || 'fade',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const slug = `${wizardState.vertical?.toLowerCase().replace(/\s+/g, '-')}-${wizardState.goal?.replace(/_/g, '-')}-${Date.now()}`;

    const offerData: Partial<InhouseOffer> = {
      name: `${wizardState.vertical} ${wizardState.goal?.replace('_', ' ')} Offer`,
      slug: slug,
      vertical: wizardState.vertical || 'GEN',
      status: 'draft',
      default_payout: 0,
      is_published: false,
      config: {
        wizard_metadata: {
          used_wizard: true,
          template_id: wizardState.template?.id,
          ai_optimized: wizardState.useAI,
          created_at: new Date().toISOString(),
        },
        webhook_url: wizardState.routing?.webhook_url,
        email_notifications: wizardState.routing?.email_notifications,
        theme: {
          name: 'Wizard Theme',
          primaryColor: wizardState.design?.primaryColor || '#3b82f6',
          secondaryColor: '#64748b',
          backgroundColor: wizardState.design?.backgroundColor || '#ffffff',
          textColor: '#1e293b',
          headingColor: '#0f172a',
          buttonStyle: 'rounded' as const,
          buttonSize: 'medium' as const,
          fontFamily: wizardState.design?.fontFamily || 'Inter, sans-serif',
          fontSize: {
            base: '16px',
            heading: '24px',
          },
          spacing: {
            padding: '1rem',
            margin: '1rem',
          },
          borderRadius: '0.5rem',
          shadows: {
            card: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            button: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          },
          animations: {
            enabled: true,
            speed: '200ms',
          },
          progressBar: {
            style: 'bar' as const,
            height: '4px',
            color: wizardState.design?.primaryColor || '#3b82f6',
          },
        },
      },
    };

    if (wizardState.template?.id) {
      await incrementTemplateUsage(wizardState.template.id);
    }

    onComplete(offerData, steps);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear wizard state:', error);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Create New Offer
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Step {wizardState.step} of {STEPS.length}: {STEPS[wizardState.step - 1].label}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                      ${
                        wizardState.step > step.id
                          ? 'bg-green-600 text-white'
                          : wizardState.step === step.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }
                    `}
                  >
                    {wizardState.step > step.id ? <Check size={16} /> : step.id}
                  </div>
                  <span
                    className={`
                      text-xs font-medium hidden md:inline
                      ${
                        wizardState.step >= step.id
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-400 dark:text-slate-500'
                      }
                    `}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`
                      flex-1 h-0.5 mx-2
                      ${
                        wizardState.step > step.id
                          ? 'bg-green-600'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {wizardState.step === 1 && (
            <WizardStepVertical
              selectedVertical={wizardState.vertical}
              selectedGoal={wizardState.goal}
              onVerticalChange={(vertical) => updateWizardState({ vertical })}
              onGoalChange={(goal) => updateWizardState({ goal })}
            />
          )}

          {wizardState.step === 2 && wizardState.vertical && wizardState.goal && (
            <WizardStepTemplate
              vertical={wizardState.vertical}
              goal={wizardState.goal}
              selectedTemplate={wizardState.template}
              onTemplateChange={(template) => updateWizardState({ template: template || undefined })}
            />
          )}

          {wizardState.step === 3 && (
            <WizardStepAISuggestions
              vertical={wizardState.vertical || ''}
              goal={wizardState.goal || ''}
              templateSteps={wizardState.template?.suggested_steps}
              useAI={wizardState.useAI}
              onUseAIChange={(useAI) => updateWizardState({ useAI })}
            />
          )}

          {wizardState.step === 4 && (
            <WizardStepDesign
              design={wizardState.design || {}}
              onDesignChange={(design) => updateWizardState({ design })}
            />
          )}

          {wizardState.step === 5 && (
            <WizardStepRouting
              routing={wizardState.routing || {}}
              onRoutingChange={(routing) => updateWizardState({ routing })}
            />
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleBack}
            disabled={wizardState.step === 1}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            {onSkipToBuilder && (
              <button
                onClick={onSkipToBuilder}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Skip to Builder
              </button>
            )}
          </div>

          {wizardState.step < STEPS.length ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              Next
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
            >
              <Check size={18} />
              Create Offer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
