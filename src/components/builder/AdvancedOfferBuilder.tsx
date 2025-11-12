import { useState, useEffect } from 'react';
import {
  Save,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import type { InhouseOffer, OfferStep, OfferTheme } from '../../types/inhouseOffer';
import {
  createOffer,
  updateOffer,
  getOfferSteps,
  saveAllOfferSteps,
  getOfferById,
} from '../../services/offerService';
import { getAllThemes } from '../../services/offerTemplateService';
import { retryOperation, validateOfferData, formatValidationErrors, getFieldError } from '../../lib/retry-utils';
import { OfferPreviewCanvas } from './OfferPreviewCanvas';
import { StepDesignerPanel } from './StepDesignerPanel';
import { ThemeEditorPanel } from './ThemeEditorPanel';
import { PublishPanel } from './PublishPanel';
import { SEOModal } from './SEOModal';
import { DesignSettingsPanel } from './DesignSettingsPanel';
import { SettingsPanel } from './SettingsPanel';
import { FlowDiagramPanel } from './FlowDiagramPanel';
import { QuickActionsToolbar, useQuickActions, getOfferBuilderActions } from './QuickActionsToolbar';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { TemplateQuickSelector } from '../ui/TemplateQuickSelector';
import type { WizardTemplate } from '../../types/dynamicContent';

interface AdvancedOfferBuilderProps {
  offerId?: string;
  onSave?: (offerId: string) => void;
  onBack?: () => void;
}

type ViewMode = 'desktop' | 'tablet' | 'mobile';
type PanelMode = 'settings' | 'steps' | 'flow' | 'design' | 'theme' | 'publish' | 'templates';
type LayoutMode = 'full' | 'split';

export function AdvancedOfferBuilder({ offerId, onSave, onBack }: AdvancedOfferBuilderProps) {
  const [offer, setOffer] = useState<Partial<InhouseOffer>>({
    name: '',
    slug: '',
    vertical: 'EDU',
    status: 'draft',
    default_payout: 0,
    config: {},
  });

  const [steps, setSteps] = useState<OfferStep[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [panelMode, setPanelMode] = useState<PanelMode>('settings');
  const [themes, setThemes] = useState<OfferTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<OfferTheme | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [showSEOModal, setShowSEOModal] = useState(false);
  const [saveProgress, setSaveProgress] = useState('');
  const [validationErrors, setValidationErrors] = useState<{field: string; message: string}[]>([]);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('full');

  const { showToolbar } = useQuickActions();

  useEffect(() => {
    loadThemes();
    if (offerId) {
      loadOffer();
    } else {
      initializeNewOffer();
    }
  }, [offerId]);

  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (autoSaveStatus === 'unsaved' && offer.name) {
        handleAutoSave();
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [offer, steps, autoSaveStatus]);

  async function loadThemes() {
    try {
      const themesData = await getAllThemes();
      setThemes(themesData);
      if (themesData.length > 0 && !selectedTheme) {
        setSelectedTheme(themesData[0]);
      }
    } catch (error) {
      console.error('Failed to load themes:', error);
    }
  }

  async function loadOffer() {
    try {
      console.log('=== AdvancedOfferBuilder: Loading Offer ===');
      console.log('Offer ID:', offerId);

      const [offerData, stepsData] = await Promise.all([
        getOfferById(offerId!),
        getOfferSteps(offerId!),
      ]);

      console.log('Offer data loaded:', offerData ? 'Success' : 'Not found');
      console.log('Steps loaded:', stepsData?.length || 0, 'steps');

      if (!offerData) {
        alert('Offer not found. It may have been deleted or you do not have permission to view it.');
        if (onBack) onBack();
        return;
      }

      setOffer(offerData);
      if (offerData.config?.theme) {
        setSelectedTheme(offerData.config.theme);
      }

      setSteps(stepsData);
      setAutoSaveStatus('saved');
      console.log('=== Offer loaded successfully ===');
    } catch (error: any) {
      console.error('=== AdvancedOfferBuilder: Error Loading Offer ===');
      console.error('Error:', error);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.details);

      let errorMessage = 'Failed to load offer. ';
      if (error?.message) {
        if (error.message.includes('not found')) {
          errorMessage += 'The offer could not be found.';
        } else if (error.message.includes('permission') || error.message.includes('policy')) {
          errorMessage += 'You do not have permission to edit this offer.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please try again or contact support.';
      }

      alert(errorMessage);
      if (onBack) onBack();
    }
  }

  async function initializeNewOffer() {
    if (themes.length > 0) {
      setOffer(prev => ({
        ...prev,
        config: {
          ...prev.config,
          theme: themes[0],
        },
      }));
      setSelectedTheme(themes[0]);
    }
  }

  async function handleAutoSave() {
    if (!offer.name || !offer.slug) return;

    try {
      setAutoSaveStatus('saving');
      if (offerId) {
        await updateOffer(offerId, offer);
      }
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('unsaved');
    }
  }

  async function handleSave() {
    setValidationErrors([]);
    setSaveProgress('');

    const validation = validateOfferData(offer);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      alert(formatValidationErrors(validation.errors));
      return;
    }

    setSaving(true);

    try {
      let savedOffer: InhouseOffer;
      const currentOfferId = offerId;

      if (currentOfferId) {
        setSaveProgress('Updating offer details...');
        savedOffer = await retryOperation(
          () => updateOffer(currentOfferId, offer),
          { maxAttempts: 3, delayMs: 1000 }
        );

        setSaveProgress('Saving offer steps...');
        const savedSteps = await retryOperation(
          () => saveAllOfferSteps(currentOfferId, steps),
          { maxAttempts: 3, delayMs: 1000 }
        );
        setSteps(savedSteps);
      } else {
        setSaveProgress('Creating new offer...');
        savedOffer = await retryOperation(
          () => createOffer(offer as any),
          { maxAttempts: 3, delayMs: 1000 }
        );

        setSaveProgress('Saving offer steps...');
        const savedSteps = await retryOperation(
          () => saveAllOfferSteps(savedOffer.id, steps),
          { maxAttempts: 3, delayMs: 1000 }
        );
        setSteps(savedSteps);
        setOffer(savedOffer);
        window.history.replaceState(null, '', `?offerId=${savedOffer.id}`);
      }

      setSaveProgress('Version backup complete...');

      setAutoSaveStatus('saved');
      setValidationErrors([]);
      alert('✓ Offer saved successfully!');
      if (onSave) onSave(savedOffer.id);
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
      setAutoSaveStatus('unsaved');
    } finally {
      setSaving(false);
      setSaveProgress('');
    }
  }

  function handleOfferChange(updates: Partial<InhouseOffer>) {
    setOffer(prev => ({ ...prev, ...updates }));
    setAutoSaveStatus('unsaved');
  }

  function handleStepsChange(newSteps: OfferStep[]) {
    setSteps(newSteps);
    setAutoSaveStatus('unsaved');
  }

  function handleStepUpdate(stepId: string, updates: Partial<OfferStep>) {
    setSteps(steps.map(s => (s.id === stepId ? { ...s, ...updates } : s)));
    setAutoSaveStatus('unsaved');
  }

  function handleThemeChange(theme: OfferTheme) {
    setSelectedTheme(theme);
    handleOfferChange({
      config: {
        ...offer.config,
        theme,
      },
    });
  }

  function handleLoadTemplate(template: WizardTemplate) {
    if (steps.length > 0) {
      const confirmed = window.confirm(
        'Loading a template will replace your current steps. Are you sure you want to continue?'
      );
      if (!confirmed) return;
    }

    const templateSteps: OfferStep[] = (template.suggested_steps || []).map((step: any, index: number) => ({
      id: `temp-${Date.now()}-${index}`,
      offer_id: offerId || '',
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

    setSteps(templateSteps);
    handleOfferChange({
      name: offer.name || template.name,
      vertical: template.vertical,
    });

    setAutoSaveStatus('unsaved');
    setPanelMode('steps');
    alert(`✓ Template "${template.name}" loaded with ${templateSteps.length} steps!`);
  }

  const selectedStep = steps.find(s => s.id === selectedStepId);
  const selectedStepIndex = selectedStepId ? steps.findIndex(s => s.id === selectedStepId) : -1;

  const quickActions = getOfferBuilderActions({
    selectedStepId,
    onAddStep: () => {
      setPanelMode('steps');
      const newStep: OfferStep = {
        id: `temp-${Date.now()}`,
        offer_id: offerId || '',
        step_order: steps.length,
        step_type: 'single_choice',
        question_text: 'New Question',
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ],
        validation_rules: { required: true },
        conditional_logic: {},
        step_layout: 'centered',
        animation_type: 'fade',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      handleStepsChange([...steps, newStep]);
      setSelectedStepId(newStep.id);
    },
    onDuplicateStep: () => {
      if (!selectedStep) return;
      const newStep: OfferStep = {
        ...selectedStep,
        id: `temp-${Date.now()}`,
        step_order: steps.length,
        question_text: `${selectedStep.question_text} (Copy)`,
      };
      handleStepsChange([...steps, newStep]);
      setSelectedStepId(newStep.id);
    },
    onDeleteStep: () => {
      if (!selectedStepId) return;
      if (confirm('Are you sure you want to delete this step?')) {
        handleStepsChange(steps.filter(s => s.id !== selectedStepId));
        setSelectedStepId(steps[0]?.id || null);
      }
    },
    onMoveStepUp: () => {
      if (!selectedStepId || selectedStepIndex <= 0) return;
      const newSteps = [...steps];
      [newSteps[selectedStepIndex], newSteps[selectedStepIndex - 1]] =
        [newSteps[selectedStepIndex - 1], newSteps[selectedStepIndex]];
      newSteps.forEach((step, idx) => {
        step.step_order = idx;
      });
      handleStepsChange(newSteps);
    },
    onMoveStepDown: () => {
      if (!selectedStepId || selectedStepIndex >= steps.length - 1) return;
      const newSteps = [...steps];
      [newSteps[selectedStepIndex], newSteps[selectedStepIndex + 1]] =
        [newSteps[selectedStepIndex + 1], newSteps[selectedStepIndex]];
      newSteps.forEach((step, idx) => {
        step.step_order = idx;
      });
      handleStepsChange(newSteps);
    },
    onBrowseTemplates: () => {
      setPanelMode('steps');
      setShowTemplateGallery(true);
    },
    onPreview: () => {
      if (offer.slug && offer.id) {
        window.open(`/offer/${offer.slug}`, '_blank');
      } else {
        alert('Please save the offer first to preview');
      }
    },
    onSave: handleSave,
    onTestLogic: () => {
      if (selectedStep) {
        alert('Test Logic: This would open a logic testing interface for the selected step.');
      }
    },
    onViewAnalytics: () => {
      alert('Analytics: This would show step-by-step performance analytics.');
    },
    onFlowView: () => {
      setPanelMode('flow');
    },
    canMoveUp: selectedStepIndex > 0,
    canMoveDown: selectedStepIndex >= 0 && selectedStepIndex < steps.length - 1,
    hasChanges: autoSaveStatus === 'unsaved',
  });

  const viewportSizes = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          )}
          <div>
            <input
              type="text"
              value={offer.name}
              onChange={(e) => {
                handleOfferChange({ name: e.target.value });
                if (validationErrors.some(e => e.field === 'name')) {
                  setValidationErrors(validationErrors.filter(e => e.field !== 'name'));
                }
              }}
              placeholder="Offer Name"
              className={`text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white ${
                getFieldError(validationErrors, 'name') ? 'text-red-600' : ''
              }`}
              disabled={saving}
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {saving && saveProgress ? saveProgress : ''}
              {!saving && autoSaveStatus === 'saved' && 'All changes saved'}
              {!saving && autoSaveStatus === 'saving' && 'Saving...'}
              {!saving && autoSaveStatus === 'unsaved' && 'Unsaved changes'}
            </p>
            {getFieldError(validationErrors, 'name') && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {getFieldError(validationErrors, 'name')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-2">
            <button
              onClick={() => setLayoutMode('full')}
              className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                layoutMode === 'full'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Full Editor"
            >
              Editor
            </button>
            <button
              onClick={() => setLayoutMode('split')}
              className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                layoutMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Split View"
            >
              Split
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'desktop'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor size={18} />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'tablet'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Tablet size={18} />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'mobile'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone size={18} />
            </button>
          </div>

          <button
            onClick={() => {
              if (offer.slug && offer.id) {
                window.open(`/offer/${offer.slug}`, '_blank');
              } else {
                alert('Please save the offer first to preview');
              }
            }}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Eye size={18} />
            Preview
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <CollapsibleSidebar
          activePanel={panelMode}
          onPanelChange={(panel) => setPanelMode(panel as PanelMode)}
          offerStatus={offer.status}
          stepCount={steps.length}
        />

        <div className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto ${layoutMode === 'split' ? 'w-96' : 'flex-shrink-0'}`}>
          <div className="p-6">
            {panelMode === 'settings' && (
              <SettingsPanel
                offer={offer}
                onOfferChange={handleOfferChange}
              />
            )}
            {panelMode === 'steps' && (
              <StepDesignerPanel
                steps={steps}
                selectedStepId={selectedStepId}
                onStepsChange={handleStepsChange}
                onStepSelect={setSelectedStepId}
              />
            )}
            {panelMode === 'flow' && (
              <FlowDiagramPanel
                steps={steps}
                onStepClick={(stepId) => {
                  setSelectedStepId(stepId);
                  setPanelMode('steps');
                }}
              />
            )}
            {panelMode === 'design' && selectedTheme && (
              <DesignSettingsPanel
                theme={selectedTheme}
                onThemeChange={handleThemeChange}
              />
            )}
            {panelMode === 'theme' && (
              <ThemeEditorPanel
                themes={themes}
                selectedTheme={selectedTheme}
                onThemeChange={handleThemeChange}
              />
            )}
            {panelMode === 'publish' && offerId && (
              <PublishPanel
                offerId={offerId}
                offer={offer as InhouseOffer}
                onOpenSEO={() => setShowSEOModal(true)}
              />
            )}
            {panelMode === 'templates' && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Templates</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Load a professional template to get started faster. All templates can be fully customized.
                </p>

                {steps.length > 0 && (
                  <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      ⚠️ Loading a template will replace your current {steps.length} step(s).
                    </p>
                  </div>
                )}

                <TemplateQuickSelector
                  onSelectTemplate={handleLoadTemplate}
                />
              </div>
            )}
          </div>
        </div>

        {layoutMode === 'full' ? (
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 overflow-auto p-8">
            <div className={`mx-auto transition-all duration-300 ${viewportSizes[viewMode]}`}>
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl overflow-hidden">
                <OfferPreviewCanvas
                  offer={offer as InhouseOffer}
                  steps={steps}
                  theme={selectedTheme || themes[0]}
                  selectedStepId={selectedStepId}
                  onStepClick={setSelectedStepId}
                  onStepUpdate={handleStepUpdate}
                  realTimeSync={true}
                  autoScroll={true}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex bg-slate-100 dark:bg-slate-950 overflow-hidden">
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl h-full">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Live Preview
                  </h3>
                </div>
                <div className="overflow-auto" style={{ height: 'calc(100% - 57px)' }}>
                  <OfferPreviewCanvas
                    offer={offer as InhouseOffer}
                    steps={steps}
                    theme={selectedTheme || themes[0]}
                    selectedStepId={selectedStepId}
                    onStepClick={setSelectedStepId}
                    onStepUpdate={handleStepUpdate}
                    realTimeSync={true}
                    autoScroll={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <SEOModal
        isOpen={showSEOModal}
        onClose={() => setShowSEOModal(false)}
        initialData={offer.config?.seo}
        onSave={(seoData) => {
          handleOfferChange({
            config: {
              ...offer.config,
              seo: seoData,
            },
          });
        }}
      />

      {showToolbar && (
        <QuickActionsToolbar
          actions={quickActions}
          selectedContext={selectedStepId ? `Step ${selectedStepIndex + 1}` : undefined}
          position="floating"
        />
      )}
    </div>
  );
}
