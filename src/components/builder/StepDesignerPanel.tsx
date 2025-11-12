import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Copy, GitBranch, Sparkles, Eye, Wand2 } from 'lucide-react';
import type { OfferStep, StepType } from '../../types/inhouseOffer';
import { ConditionalLogicPanel } from './ConditionalLogicPanel';
import { StepBranchingPanel } from './StepBranchingPanel';
import { ConditionalTemplatesPanel } from './ConditionalTemplatesPanel';
import type { ConditionalTemplate } from '../../data/conditionalTemplates';
import { StepTemplateGallery} from './StepTemplateGallery';
import type { StepTemplate } from '../../types/stepTemplate';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { DynamicVariableInserter } from './DynamicVariableInserter';

interface StepDesignerPanelProps {
  steps: OfferStep[];
  selectedStepId: string | null;
  onStepsChange: (steps: OfferStep[]) => void;
  onStepSelect: (stepId: string | null) => void;
}

const STEP_TYPES: { value: StepType; label: string; icon: string }[] = [
  { value: 'single_choice', label: 'Single Choice', icon: '◉' },
  { value: 'multi_choice', label: 'Multiple Choice', icon: '☑' },
  { value: 'yes_no', label: 'Yes/No', icon: '✓' },
  { value: 'text_input', label: 'Text Input', icon: 'Aa' },
  { value: 'email', label: 'Email', icon: '@' },
  { value: 'phone', label: 'Phone', icon: '☎' },
  { value: 'dropdown', label: 'Dropdown', icon: '▼' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'number', label: 'Number', icon: '#' },
  { value: 'zip_code', label: 'ZIP Code', icon: '📍' },
  { value: 'address', label: 'Address', icon: '🏠' },
];

const STEP_LAYOUTS = [
  { value: 'centered', label: 'Centered', icon: '▭' },
  { value: 'split', label: 'Split', icon: '▬' },
  { value: 'sidebar', label: 'Sidebar', icon: '▐' },
  { value: 'full-width', label: 'Full Width', icon: '▬' },
];

export function StepDesignerPanel({
  steps,
  selectedStepId,
  onStepsChange,
  onStepSelect,
}: StepDesignerPanelProps) {
  const [expandedSection, setExpandedSection] = useState<'basic' | 'conditional' | 'branching' | 'templates' | null>('basic');
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const selectedStep = steps.find(s => s.id === selectedStepId);

  const stepsWithOrder = steps.map((step, idx) => ({
    ...step,
    order: step.step_order ?? idx,
  }));

  const {
    draggedItem,
    draggedOverIndex,
    selectedItems,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    toggleSelection,
    isDragging,
    isItemSelected,
  } = useDragAndDrop<typeof stepsWithOrder[0]>();

  // TODO: Re-implement keyboard reordering
  // const { moveUp, moveDown } = useKeyboardReorder(...);

  function addStep(stepType: StepType) {
    const newStep: OfferStep = {
      id: `temp-${Date.now()}`,
      offer_id: '',
      step_order: steps.length,
      step_type: stepType,
      question_text: 'New Question',
      options: stepType.includes('choice') || stepType === 'yes_no' || stepType === 'dropdown'
        ? [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ]
        : [],
      validation_rules: { required: true },
      conditional_logic: {},
      step_layout: 'centered',
      animation_type: 'fade',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onStepsChange([...steps, newStep]);
    onStepSelect(newStep.id);
  }

  function updateStep(stepId: string, updates: Partial<OfferStep>) {
    onStepsChange(steps.map(s => (s.id === stepId ? { ...s, ...updates } : s)));
  }

  function deleteStep(stepId: string) {
    if (confirm('Are you sure you want to delete this step?')) {
      onStepsChange(steps.filter(s => s.id !== stepId));
      if (selectedStepId === stepId) {
        onStepSelect(steps[0]?.id || null);
      }
    }
  }

  function duplicateStep(stepId: string) {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const newStep: OfferStep = {
      ...step,
      id: `temp-${Date.now()}`,
      step_order: steps.length,
      question_text: `${step.question_text} (Copy)`,
    };

    onStepsChange([...steps, newStep]);
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

    onStepsChange(newSteps);
  }

  function handleTemplateSelect(template: StepTemplate) {
    const newStep: OfferStep = {
      id: `temp-${Date.now()}`,
      offer_id: '',
      step_order: steps.length,
      step_type: template.stepType,
      question_text: template.questionText,
      options: template.options || [],
      validation_rules: template.validationRules,
      conditional_logic: {},
      placeholder_text: template.placeholderText,
      help_text: template.helpText,
      field_mapping: template.fieldMapping,
      step_layout: 'centered',
      animation_type: 'fade',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onStepsChange([...steps, newStep]);
    onStepSelect(newStep.id);
  }

  return (
    <div className="space-y-6">
      {!selectedStep ? (
        <>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Add Step
              </h3>
              <button
                onClick={() => setShowTemplateGallery(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm flex items-center gap-1.5"
              >
                <Wand2 size={14} />
                Browse Templates
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STEP_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => addStep(type.value)}
                  className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg transition-colors text-left"
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {steps.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Steps ({steps.length})
                </h3>
                {selectedItems.size > 0 && (
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {selectedItems.size} selected
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {steps.map((step, index) => {
                  const isSelected = isItemSelected(step.id);
                  const isDraggedOver = draggedOverIndex === index;
                  const isBeingDragged = draggedItem?.id === step.id;

                  return (
                    <div key={step.id}>
                      {isDraggedOver && (
                        <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full mb-2 animate-pulse" />
                      )}
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(stepsWithOrder[index], e)}
                        onDragOver={(e) => handleDragOver(index, e)}
                        onDragEnd={handleDragEnd}
                        onDrop={() => handleDrop(stepsWithOrder, onStepsChange)}
                        onClick={(e) => {
                          toggleSelection(step.id, e.metaKey || e.ctrlKey);
                          if (!e.metaKey && !e.ctrlKey) {
                            onStepSelect(step.id);
                          }
                        }}
                        className={`
                          p-3 border rounded-lg cursor-move transition-all group
                          ${isSelected
                            ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600'
                          }
                          ${isBeingDragged ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical
                            size={16}
                            className={`
                              transition-colors cursor-grab active:cursor-grabbing
                              ${isSelected
                                ? 'text-blue-500 dark:text-blue-400'
                                : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400'
                              }
                            `}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Step {index + 1}
                              </span>
                              <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                                {step.step_type.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white mt-1 line-clamp-1">
                              {step.question_text}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveStep(step.id, 'up');
                              }}
                              disabled={index === 0}
                              className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveStep(step.id, 'down');
                              }}
                              disabled={index === steps.length - 1}
                              className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Edit Step
            </h3>
            <button
              onClick={() => onStepSelect(null)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to Steps
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Question Text
              </label>
              <DynamicVariableInserter
                onInsert={(variable) => {
                  const cursorPos = 0;
                  const newText = selectedStep.question_text + ' ' + variable;
                  updateStep(selectedStep.id, { question_text: newText });
                }}
              />
            </div>
            <textarea
              value={selectedStep.question_text}
              onChange={(e) => updateStep(selectedStep.id, { question_text: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Use dynamic variables like {`{{first_name}}`} to personalize questions
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Step Layout
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STEP_LAYOUTS.map((layout) => (
                <button
                  key={layout.value}
                  onClick={() => updateStep(selectedStep.id, { step_layout: layout.value as any })}
                  className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                    selectedStep.step_layout === layout.value
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="mr-2">{layout.icon}</span>
                  {layout.label}
                </button>
              ))}
            </div>
          </div>

          {['single_choice', 'multi_choice', 'yes_no', 'dropdown'].includes(selectedStep.step_type) && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                        newOptions[idx] = { ...option, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') };
                        updateStep(selectedStep.id, { options: newOptions });
                      }}
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                    <button
                      onClick={() => {
                        const newOptions = selectedStep.options.filter((_, i) => i !== idx);
                        updateStep(selectedStep.id, { options: newOptions });
                      }}
                      className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newOptions = [
                      ...selectedStep.options,
                      { value: `option${selectedStep.options.length + 1}`, label: `Option ${selectedStep.options.length + 1}` },
                    ];
                    updateStep(selectedStep.id, { options: newOptions });
                  }}
                  className="w-full px-3 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  + Add Option
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Help Text (Optional)
            </label>
            <textarea
              value={selectedStep.help_text || ''}
              onChange={(e) => updateStep(selectedStep.id, { help_text: e.target.value })}
              rows={2}
              placeholder="Additional help text shown below the question"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Field Mapping (for buyer API)
            </label>
            <input
              type="text"
              value={selectedStep.field_mapping || ''}
              onChange={(e) => updateStep(selectedStep.id, { field_mapping: e.target.value })}
              placeholder="e.g., first_name, email, phone"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
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
            <label className="text-sm text-slate-700 dark:text-slate-300">Required Field</label>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
            <button
              onClick={() => setExpandedSection(expandedSection === 'conditional' ? null : 'conditional')}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <GitBranch size={16} />
                Conditional Logic
              </span>
              <span className="text-xs text-slate-500">{expandedSection === 'conditional' ? '▼' : '▶'}</span>
            </button>

            {expandedSection === 'conditional' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                <ConditionalLogicPanel
                  currentStep={selectedStep}
                  allSteps={steps}
                  onUpdate={(logic) => updateStep(selectedStep.id, { conditional_logic: logic })}
                />
              </div>
            )}

            <button
              onClick={() => setExpandedSection(expandedSection === 'branching' ? null : 'branching')}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Eye size={16} />
                Answer Branching
              </span>
              <span className="text-xs text-slate-500">{expandedSection === 'branching' ? '▼' : '▶'}</span>
            </button>

            {expandedSection === 'branching' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                <StepBranchingPanel
                  currentStep={selectedStep}
                  allSteps={steps}
                  onUpdate={(options) => updateStep(selectedStep.id, { options })}
                />
              </div>
            )}

            <button
              onClick={() => setExpandedSection(expandedSection === 'templates' ? null : 'templates')}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={16} />
                Logic Templates
              </span>
              <span className="text-xs text-slate-500">{expandedSection === 'templates' ? '▼' : '▶'}</span>
            </button>

            {expandedSection === 'templates' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                <ConditionalTemplatesPanel
                  currentStep={selectedStep}
                  allSteps={steps}
                  onApplyTemplate={(template: ConditionalTemplate) => {
                    updateStep(selectedStep.id, { conditional_logic: template.logic });
                    setExpandedSection('conditional');
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => duplicateStep(selectedStep.id)}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Copy size={16} />
              Duplicate
            </button>
            <button
              onClick={() => deleteStep(selectedStep.id)}
              className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      )}

      <StepTemplateGallery
        isOpen={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
        onSelectTemplate={handleTemplateSelect}
        currentVertical="all"
      />
    </div>
  );
}
