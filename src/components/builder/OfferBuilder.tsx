import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Save, Eye, Settings, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import { InhouseOffer, OfferStep, StepType, StepOption } from '../../types/inhouseOffer';
import {
  createOffer,
  updateOffer,
  getOfferSteps,
  createOfferStep,
  updateOfferStep,
  deleteOfferStep,
  reorderSteps,
} from '../services/offerService';
import { retryOperation, validateOfferData, formatValidationErrors, getFieldError } from '../lib/retry-utils';

interface OfferBuilderProps {
  offerId?: string;
  onSave?: () => void;
}

export function OfferBuilder({ offerId, onSave }: OfferBuilderProps) {
  const [offer, setOffer] = useState<Partial<InhouseOffer>>({
    name: '',
    slug: '',
    vertical: 'EDU',
    status: 'draft',
    default_payout: 0,
    config: {
      progressBar: { style: 'bar', position: 'top' },
      theme: {
        primaryColor: '#6366f1',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        buttonStyle: 'rounded',
      },
    },
  });

  const [steps, setSteps] = useState<OfferStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<OfferStep | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveAttempt, setSaveAttempt] = useState(0);
  const [validationErrors, setValidationErrors] = useState<{field: string; message: string}[]>([]);

  useEffect(() => {
    if (offerId) {
      loadOffer();
    }
  }, [offerId]);

  async function loadOffer() {
    const stepsData = await getOfferSteps(offerId!);
    setSteps(stepsData);
  }

  async function handleSaveOffer() {
    setValidationErrors([]);

    const validation = validateOfferData(offer);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      alert(formatValidationErrors(validation.errors));
      return;
    }

    setSaving(true);
    setSaveAttempt(0);

    try {
      let savedOffer;

      if (offerId) {
        savedOffer = await retryOperation(
          () => updateOffer(offerId, offer),
          {
            maxAttempts: 3,
            delayMs: 1000,
            backoffMultiplier: 2,
          }
        );
      } else {
        savedOffer = await retryOperation(
          () => createOffer(offer as any),
          {
            maxAttempts: 3,
            delayMs: 1000,
            backoffMultiplier: 2,
          }
        );
      }

      for (const step of steps) {
        setSaveAttempt(prev => prev + 1);
        if (step.id.startsWith('temp-')) {
          await retryOperation(
            () => createOfferStep({
              ...step,
              offer_id: savedOffer.id,
            }),
            { maxAttempts: 2 }
          );
        } else {
          await retryOperation(
            () => updateOfferStep(step.id, step),
            { maxAttempts: 2 }
          );
        }
      }

      alert('✓ Offer saved successfully!');
      setValidationErrors([]);
      if (onSave) onSave();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to save offer';
      console.error('Offer save error:', error);

      const isNetworkError = errorMessage.toLowerCase().includes('network') ||
                            errorMessage.toLowerCase().includes('fetch') ||
                            errorMessage.toLowerCase().includes('connection');

      if (isNetworkError) {
        alert(`Network Error: Unable to save offer. Please check your internet connection and try again.\n\nDetails: ${errorMessage}`);
      } else {
        alert(`Save Failed: ${errorMessage}`);
      }
    } finally {
      setSaving(false);
      setSaveAttempt(0);
    }
  }

  function addStep(stepType: StepType) {
    const newStep: OfferStep = {
      id: `temp-${Date.now()}`,
      offer_id: offerId || '',
      step_order: steps.length,
      step_type: stepType,
      question_text: 'New Question',
      options: [],
      validation_rules: { required: true },
      conditional_logic: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSteps([...steps, newStep]);
    setSelectedStep(newStep);
  }

  function updateStep(stepId: string, updates: Partial<OfferStep>) {
    setSteps(steps.map(s => (s.id === stepId ? { ...s, ...updates } : s)));
    if (selectedStep?.id === stepId) {
      setSelectedStep({ ...selectedStep, ...updates });
    }
  }

  function removeStep(stepId: string) {
    if (confirm('Are you sure you want to delete this step?')) {
      if (!stepId.startsWith('temp-')) {
        deleteOfferStep(stepId);
      }
      setSteps(steps.filter(s => s.id !== stepId));
      if (selectedStep?.id === stepId) {
        setSelectedStep(null);
      }
    }
  }

  function moveStep(stepId: string, direction: 'up' | 'down') {
    const index = steps.findIndex(s => s.id === stepId);
    if (index === -1) return;

    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];

    newSteps.forEach((step, idx) => {
      step.step_order = idx;
    });

    setSteps(newSteps);
  }

  const stepTypes: { value: StepType; label: string }[] = [
    { value: 'single_choice', label: 'Single Choice' },
    { value: 'multi_choice', label: 'Multiple Choice' },
    { value: 'yes_no', label: 'Yes/No' },
    { value: 'text_input', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'date', label: 'Date' },
    { value: 'number', label: 'Number' },
    { value: 'zip_code', label: 'ZIP Code' },
    { value: 'address', label: 'Address' },
  ];

  return (
    <div className="flex gap-6 h-screen">
      <div className="w-80 bg-card border-r border-border overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Offer Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Offer Name *
              </label>
              <input
                type="text"
                value={offer.name}
                onChange={(e) => {
                  setOffer({ ...offer, name: e.target.value });
                  if (validationErrors.some(e => e.field === 'name')) {
                    setValidationErrors(validationErrors.filter(e => e.field !== 'name'));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground ${
                  getFieldError(validationErrors, 'name') ? 'border-red-500' : 'border-border'
                }`}
                placeholder="My Offer"
                disabled={saving}
              />
              {getFieldError(validationErrors, 'name') && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {getFieldError(validationErrors, 'name')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                URL Slug *
              </label>
              <input
                type="text"
                value={offer.slug}
                onChange={(e) => {
                  const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                  setOffer({ ...offer, slug });
                  if (validationErrors.some(e => e.field === 'slug')) {
                    setValidationErrors(validationErrors.filter(e => e.field !== 'slug'));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground ${
                  getFieldError(validationErrors, 'slug') ? 'border-red-500' : 'border-border'
                }`}
                placeholder="my-offer"
                disabled={saving}
              />
              {getFieldError(validationErrors, 'slug') && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {getFieldError(validationErrors, 'slug')}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Preview: /offer/{offer.slug || 'your-slug'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Vertical
              </label>
              <select
                value={offer.vertical}
                onChange={(e) => setOffer({ ...offer, vertical: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="EDU">Education</option>
                <option value="SSD">Social Security Disability</option>
                <option value="Insurance">Insurance</option>
                <option value="Solar">Solar</option>
                <option value="Home Services">Home Services</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Status
              </label>
              <select
                value={offer.status}
                onChange={(e) => setOffer({ ...offer, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Default Payout ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={offer.default_payout}
                onChange={(e) => setOffer({ ...offer, default_payout: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-foreground mb-3">Add Step</h4>
            <div className="grid grid-cols-2 gap-2">
              {stepTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => addStep(type.value)}
                  className="px-3 py-2 text-xs bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-card overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">Steps ({steps.length})</h3>
            <div className="flex gap-2">
              <button
                onClick={handleSaveOffer}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    {saveAttempt > 0 ? `Saving step ${saveAttempt}/${steps.length}...` : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Offer
                  </>
                )}
              </button>
            </div>
          </div>

          {steps.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No steps yet. Add your first step from the sidebar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  onClick={() => setSelectedStep(step)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedStep?.id === step.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-border hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical size={20} className="text-muted-foreground cursor-move" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Step {index + 1}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded">
                          {step.step_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {step.question_text}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveStep(step.id, 'up');
                        }}
                        disabled={index === 0}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveStep(step.id, 'down');
                        }}
                        disabled={index === steps.length - 1}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStep(step.id);
                        }}
                        className="p-1 text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedStep && (
        <div className="w-96 bg-card border-l border-border overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Step Editor</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Question Text
                </label>
                <textarea
                  value={selectedStep.question_text}
                  onChange={(e) =>
                    updateStep(selectedStep.id, { question_text: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>

              {['single_choice', 'multi_choice', 'yes_no', 'dropdown'].includes(
                selectedStep.step_type
              ) && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    {(selectedStep.options || []).map((option, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) => {
                            const newOptions = [...selectedStep.options];
                            newOptions[idx] = { ...option, label: e.target.value, value: e.target.value };
                            updateStep(selectedStep.id, { options: newOptions });
                          }}
                          className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                        />
                        <button
                          onClick={() => {
                            const newOptions = selectedStep.options.filter((_, i) => i !== idx);
                            updateStep(selectedStep.id, { options: newOptions });
                          }}
                          className="p-2 text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newOptions = [
                          ...selectedStep.options,
                          { value: '', label: 'New Option' },
                        ];
                        updateStep(selectedStep.id, { options: newOptions });
                      }}
                      className="w-full px-3 py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              )}

              {['text_input', 'email', 'phone', 'zip_code', 'address'].includes(
                selectedStep.step_type
              ) && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={selectedStep.placeholder_text || ''}
                    onChange={(e) =>
                      updateStep(selectedStep.id, { placeholder_text: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Field Mapping (for buyer API)
                </label>
                <input
                  type="text"
                  value={selectedStep.field_mapping || ''}
                  onChange={(e) => updateStep(selectedStep.id, { field_mapping: e.target.value })}
                  placeholder="e.g., first_name, email, phone"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedStep.validation_rules.required || false}
                  onChange={(e) =>
                    updateStep(selectedStep.id, {
                      validation_rules: {
                        ...selectedStep.validation_rules,
                        required: e.target.checked,
                      },
                    })
                  }
                  className="rounded"
                />
                <label className="text-sm text-foreground">Required Field</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Help Text
                </label>
                <textarea
                  value={selectedStep.help_text || ''}
                  onChange={(e) => updateStep(selectedStep.id, { help_text: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  placeholder="Optional help text shown below the question"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
