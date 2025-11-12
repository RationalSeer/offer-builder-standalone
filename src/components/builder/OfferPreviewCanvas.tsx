import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronRight, Check, Edit2 } from 'lucide-react';
import type { InhouseOffer, OfferStep, OfferTheme } from '../../types/inhouseOffer';
import { debounce } from '../../lib/utils';

interface OfferPreviewCanvasProps {
  offer: InhouseOffer;
  steps: OfferStep[];
  theme: OfferTheme;
  selectedStepId: string | null;
  onStepClick: (stepId: string) => void;
  onStepUpdate?: (stepId: string, updates: Partial<OfferStep>) => void;
  realTimeSync?: boolean;
  autoScroll?: boolean;
}

export function OfferPreviewCanvas({
  offer,
  steps,
  theme,
  selectedStepId,
  onStepClick,
  onStepUpdate,
  realTimeSync = true,
  autoScroll = true,
}: OfferPreviewCanvasProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editingQuestionId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingQuestionId]);

  useEffect(() => {
    if (autoScroll && selectedStepId && stepRefs.current[selectedStepId] && containerRef.current) {
      const stepElement = stepRefs.current[selectedStepId];
      const container = containerRef.current;

      const stepTop = stepElement.offsetTop;
      const stepHeight = stepElement.offsetHeight;
      const containerHeight = container.clientHeight;
      const scrollTop = container.scrollTop;

      if (stepTop < scrollTop || stepTop + stepHeight > scrollTop + containerHeight) {
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedStepId, autoScroll]);

  const debouncedUpdate = useMemo(
    () =>
      onStepUpdate && realTimeSync
        ? debounce((stepId: string, updates: Partial<OfferStep>) => {
            onStepUpdate(stepId, updates);
          }, 500)
        : null,
    [onStepUpdate, realTimeSync]
  );

  if (steps.length === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center p-12">
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Add steps to see the preview
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
            Use the Steps panel to add your first step
          </p>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  function handleQuestionDoubleClick(step: OfferStep) {
    setEditingQuestionId(step.id);
    setEditingText(step.question_text);
  }

  function handleQuestionSave() {
    if (editingQuestionId && onStepUpdate && editingText.trim()) {
      onStepUpdate(editingQuestionId, { question_text: editingText });
    }
    setEditingQuestionId(null);
    setEditingText('');
  }

  function handleQuestionCancel() {
    setEditingQuestionId(null);
    setEditingText('');
  }

  function handleQuestionKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuestionSave();
    } else if (e.key === 'Escape') {
      handleQuestionCancel();
    }
  }

  const getLayoutStyle = (step: OfferStep) => {
    switch (step.step_layout) {
      case 'split':
        return 'grid grid-cols-2 gap-8';
      case 'sidebar':
        return 'grid grid-cols-3 gap-8';
      case 'full-width':
        return 'w-full';
      default:
        return 'max-w-2xl mx-auto';
    }
  };

  const getBackgroundStyle = (step: OfferStep) => {
    if (!step.step_background) return {};

    switch (step.step_background.type) {
      case 'gradient':
        return { background: step.step_background.value };
      case 'image':
        return {
          backgroundImage: `url(${step.step_background.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      default:
        return { backgroundColor: step.step_background.value || theme.backgroundColor };
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
      }}
      className="overflow-y-auto max-h-screen"
    >
      {offer.config?.progressBar?.style !== 'none' && (
        <div className="border-b" style={{ borderColor: theme.primaryColor + '20' }}>
          <div
            style={{
              height: theme.progressBar.height,
              background: theme.progressBar.style === 'gradient'
                ? `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                : theme.progressBar.color,
              width: `${progress}%`,
              transition: 'width 300ms ease',
            }}
          />
          <div className="px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-medium">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      <div
        className="min-h-[500px] p-8"
        style={getBackgroundStyle(currentStep)}
      >
        <div className={getLayoutStyle(currentStep)}>
          {currentStep.step_image_url && currentStep.step_layout === 'split' && (
            <div className="flex items-center justify-center">
              <img
                src={currentStep.step_image_url}
                alt="Step visual"
                className="rounded-lg shadow-lg max-w-full h-auto"
              />
            </div>
          )}

          <div
            ref={(el) => (stepRefs.current[currentStep.id] = el)}
            className={`group relative ${
              selectedStepId === currentStep.id
                ? 'ring-2 ring-blue-500 ring-offset-4'
                : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-2'
            } rounded-lg p-8 transition-all cursor-pointer`}
            style={{
              backgroundColor: theme.backgroundColor,
              boxShadow: theme.shadows.card,
            }}
            onClick={() => onStepClick(currentStep.id)}
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg shadow-lg">
                <Edit2 size={12} />
                Click to edit in sidebar
              </div>
            </div>
            {currentStep.step_icon && (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: theme.primaryColor + '20' }}
              >
                <span className="text-3xl">{currentStep.step_icon}</span>
              </div>
            )}

            {editingQuestionId === currentStep.id ? (
              <div className="mb-4">
                <textarea
                  ref={textareaRef}
                  value={editingText}
                  onChange={(e) => {
                    const newText = e.target.value;
                    setEditingText(newText);
                    if (debouncedUpdate && realTimeSync) {
                      debouncedUpdate(currentStep.id, { question_text: newText });
                    }
                  }}
                  onKeyDown={handleQuestionKeyDown}
                  onBlur={handleQuestionSave}
                  onClick={(e) => e.stopPropagation()}
                  rows={3}
                  className="w-full text-2xl font-bold px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: theme.headingColor, fontSize: theme.fontSize.heading }}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <span>Press Enter to save, Esc to cancel</span>
                  {realTimeSync && (
                    <span className="text-blue-600 dark:text-blue-400">• Auto-saving</span>
                  )}
                </p>
              </div>
            ) : (
              <h2
                className="group/question relative text-2xl font-bold mb-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded px-2 py-1 -mx-2 cursor-text"
                style={{ color: theme.headingColor, fontSize: theme.fontSize.heading }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleQuestionDoubleClick(currentStep);
                }}
              >
                {currentStep.question_text}
                <span className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/question:opacity-100 transition-opacity">
                  <Edit2 size={14} className="text-blue-600" />
                </span>
              </h2>
            )}

            {currentStep.help_text && (
              <p className="text-sm mb-6" style={{ color: theme.textColor + 'cc' }}>
                {currentStep.help_text}
              </p>
            )}

            <div className="mb-8">
              {renderStepInput(
                currentStep,
                responses[currentStep.id],
                (value) => setResponses({ ...responses, [currentStep.id]: value }),
                theme
              )}
            </div>

            <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
              {currentStepIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentStepIndex(currentStepIndex - 1);
                  }}
                  className="px-6 py-3 border rounded-lg font-medium transition-colors"
                  style={{
                    borderColor: theme.primaryColor + '40',
                    color: theme.primaryColor,
                    borderRadius: theme.borderRadius,
                  }}
                >
                  Back
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentStepIndex < steps.length - 1) {
                    setCurrentStepIndex(currentStepIndex + 1);
                  }
                }}
                className="flex-1 px-6 py-3 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                style={{
                  backgroundColor: theme.primaryColor,
                  borderRadius: theme.borderRadius,
                  boxShadow: theme.shadows.button,
                  fontSize: theme.buttonSize === 'xlarge' ? '18px' : theme.buttonSize === 'large' ? '16px' : '14px',
                  padding: theme.buttonSize === 'xlarge' ? '16px 32px' : theme.buttonSize === 'large' ? '12px 24px' : '10px 20px',
                }}
              >
                {currentStepIndex === steps.length - 1 ? (
                  <>
                    <Check size={20} />
                    Submit
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderStepInput(
  step: OfferStep,
  value: any,
  onChange: (value: any) => void,
  theme: OfferTheme
) {
  const inputStyle = {
    borderRadius: theme.borderRadius,
    borderColor: theme.primaryColor + '40',
    fontSize: theme.fontSize.base,
  };

  switch (step.step_type) {
    case 'single_choice':
    case 'yes_no':
      return (
        <div className="space-y-3">
          {step.options.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                e.stopPropagation();
                onChange(option.value);
              }}
              className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                value === option.value
                  ? 'ring-2 ring-offset-2'
                  : ''
              }`}
              style={{
                borderColor: value === option.value ? theme.primaryColor : theme.primaryColor + '40',
                backgroundColor: value === option.value ? theme.primaryColor + '10' : 'transparent',
                borderRadius: theme.borderRadius,
                ringColor: theme.primaryColor,
              }}
            >
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      );

    case 'multi_choice':
      return (
        <div className="space-y-3">
          {step.options.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
              style={inputStyle}
            >
              <input
                type="checkbox"
                checked={(value || []).includes(option.value)}
                onChange={(e) => {
                  e.stopPropagation();
                  const current = value || [];
                  if (e.target.checked) {
                    onChange([...current, option.value]);
                  } else {
                    onChange(current.filter((v: any) => v !== option.value));
                  }
                }}
                className="mr-3 h-5 w-5"
                style={{ accentColor: theme.primaryColor }}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="font-medium">{option.label}</span>
            </label>
          ))}
        </div>
      );

    case 'dropdown':
      return (
        <select
          value={value || ''}
          onChange={(e) => {
            e.stopPropagation();
            onChange(e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full px-4 py-3 border-2 focus:outline-none focus:ring-2"
          style={{
            ...inputStyle,
            borderColor: theme.primaryColor + '40',
          }}
        >
          <option value="">Select an option...</option>
          {step.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'text_input':
    case 'email':
    case 'phone':
    case 'zip_code':
      return (
        <input
          type={
            step.step_type === 'email'
              ? 'email'
              : step.step_type === 'phone'
              ? 'tel'
              : 'text'
          }
          value={value || ''}
          onChange={(e) => {
            e.stopPropagation();
            onChange(e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          placeholder={step.placeholder_text}
          className="w-full px-4 py-3 border-2 focus:outline-none focus:ring-2"
          style={{
            ...inputStyle,
            borderColor: theme.primaryColor + '40',
          }}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => {
            e.stopPropagation();
            onChange(e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          placeholder={step.placeholder_text}
          className="w-full px-4 py-3 border-2 focus:outline-none focus:ring-2"
          style={inputStyle}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => {
            e.stopPropagation();
            onChange(e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full px-4 py-3 border-2 focus:outline-none focus:ring-2"
          style={inputStyle}
        />
      );

    case 'address':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => {
            e.stopPropagation();
            onChange(e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          placeholder={step.placeholder_text || 'Enter your full address'}
          rows={4}
          className="w-full px-4 py-3 border-2 focus:outline-none focus:ring-2"
          style={inputStyle}
        />
      );

    default:
      return null;
  }
}
