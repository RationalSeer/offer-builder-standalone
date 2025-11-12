import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy, Play, Pause, BarChart, BookOpen } from 'lucide-react';
import { InhouseOffer, OfferStep } from '../types/inhouseOffer';
import { getAllOffers, updateOffer, cloneOffer, deleteOffer, createOffer, saveAllOfferSteps } from '../services/offerService';
import { AdvancedOfferBuilder } from '../builder/AdvancedOfferBuilder';
import { OfferCreationWizard } from '../wizard/OfferCreationWizard';
import { OfferCreationModeModal } from '../ui/OfferCreationModeModal';
import { TemplateGallery } from '../ui/TemplateGallery';
import { TemplatePreviewModal } from '../ui/TemplatePreviewModal';
import { TemplateComparisonModal } from '../ui/TemplateComparisonModal';
import { WizardTemplate } from '../types/dynamicContent';

export function InhouseOfferManager() {
  const [offers, setOffers] = useState<InhouseOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [templatePreview, setTemplatePreview] = useState<WizardTemplate | null>(null);
  const [compareTemplates, setCompareTemplates] = useState<WizardTemplate[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string | undefined>();

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    try {
      setLoading(true);
      const data = await getAllOffers();
      setOffers(data);
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(offerId: string, status: InhouseOffer['status']) {
    try {
      await updateOffer(offerId, { status });
      await loadOffers();
    } catch (error) {
      alert('Failed to update offer status');
      console.error(error);
    }
  }

  async function handleClone(offerId: string) {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    const newName = prompt('Enter name for cloned offer:', `${offer.name} (Copy)`);
    if (!newName) return;

    const newSlug = prompt('Enter URL slug for cloned offer:', `${offer.slug}-copy`);
    if (!newSlug) return;

    try {
      await cloneOffer(offerId, newName, newSlug);
      await loadOffers();
      alert('Offer cloned successfully!');
    } catch (error) {
      alert('Failed to clone offer');
      console.error(error);
    }
  }

  async function handleDelete(offerId: string) {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    if (!confirm(`Are you sure you want to delete "${offer.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteOffer(offerId);
      await loadOffers();
    } catch (error) {
      alert('Failed to delete offer');
      console.error(error);
    }
  }

  function handleEdit(offerId: string) {
    setSelectedOfferId(offerId);
    setShowBuilder(true);
  }

  function handleCreate() {
    setShowModeSelector(true);
  }

  function handleSelectWizard() {
    setShowModeSelector(false);
    setSelectedOfferId(undefined);
    setShowWizard(true);
  }

  function handleSelectBuilder() {
    setShowModeSelector(false);
    setSelectedOfferId(undefined);
    setShowBuilder(true);
  }

  async function handleWizardComplete(offerData: Partial<InhouseOffer>, steps: OfferStep[]) {
    try {
      const createdOffer = await createOffer(offerData as any);
      const createdOfferId = createdOffer.id;

      if (createdOfferId && steps.length > 0) {
        const stepsWithOfferId = steps.map(step => ({
          ...step,
          offer_id: createdOfferId,
        }));
        await saveAllOfferSteps(createdOfferId, stepsWithOfferId);
      }

      setShowWizard(false);
      setSelectedOfferId(createdOfferId);
      setShowBuilder(true);
      await loadOffers();
    } catch (error: any) {
      console.error('Failed to create offer from wizard:', error);
      const errorMessage = error?.message || 'Failed to create offer. Please try again.';
      alert(errorMessage);
    }
  }

  function handleWizardSkipToBuilder() {
    setShowWizard(false);
    setSelectedOfferId(undefined);
    setShowBuilder(true);
  }

  function handleBuilderClose() {
    setShowBuilder(false);
    setSelectedOfferId(undefined);
    loadOffers();
  }

  function handleOfferSaved(offerId: string) {
    if (!selectedOfferId && offerId) {
      setSelectedOfferId(offerId);
    }
    loadOffers();
  }

  async function handleTemplateSelect(template: WizardTemplate) {
    try {
      const templateSteps: OfferStep[] = (template.suggested_steps || []).map((step: any, index: number) => ({
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

      const offerData: Partial<InhouseOffer> = {
        name: template.name,
        slug: `${template.vertical.toLowerCase()}-${Date.now()}`,
        vertical: template.vertical,
        status: 'draft',
        default_payout: 0,
        config: {},
      };

      const createdOffer = await createOffer(offerData as any);
      const createdOfferId = createdOffer.id;

      if (createdOfferId && templateSteps.length > 0) {
        const stepsWithOfferId = templateSteps.map(step => ({
          ...step,
          offer_id: createdOfferId,
        }));
        await saveAllOfferSteps(createdOfferId, stepsWithOfferId);
      }

      setShowTemplateGallery(false);
      setSelectedOfferId(createdOfferId);
      setShowBuilder(true);
      await loadOffers();
    } catch (error: any) {
      console.error('Failed to create offer from template:', error);
      alert(error?.message || 'Failed to create offer from template');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300';
      case 'draft':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
      case 'paused':
        return 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300';
      case 'archived':
        return 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300';
      default:
        return 'bg-muted/50 text-muted-foreground';
    }
  };

  if (showBuilder) {
    return (
      <AdvancedOfferBuilder
        offerId={selectedOfferId}
        onSave={handleOfferSaved}
        onBack={handleBuilderClose}
      />
    );
  }

  if (showWizard) {
    return (
      <>
        <OfferCreationWizard
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          onComplete={handleWizardComplete}
          onSkipToBuilder={handleWizardSkipToBuilder}
        />
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <p className="text-muted-foreground">Opening wizard...</p>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading offers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">In-House Offers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage multi-step lead generation offers
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplateGallery(true)}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors flex items-center gap-2"
          >
            <BookOpen size={18} />
            Browse Templates
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Create Offer
          </button>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">No offers yet. Create your first offer to get started.</p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Create First Offer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{offer.name}</h3>
                    <p className="text-sm text-muted-foreground">{offer.slug}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(offer.status)}`}>
                    {offer.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Vertical</span>
                    <span className="font-medium text-foreground">{offer.vertical}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Payout</span>
                    <span className="font-medium text-foreground">${offer.default_payout.toFixed(2)}</span>
                  </div>
                  {offer.everflow_offer_id && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Everflow ID</span>
                      <span className="font-medium text-foreground text-xs">{offer.everflow_offer_id}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(offer.id)}
                    className="flex-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleClone(offer.id)}
                    className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                    title="Clone offer"
                  >
                    <Copy size={16} />
                  </button>
                  {offer.status === 'active' ? (
                    <button
                      onClick={() => handleStatusChange(offer.id, 'paused')}
                      className="px-3 py-2 text-sm border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                      title="Pause offer"
                    >
                      <Pause size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(offer.id, 'active')}
                      className="px-3 py-2 text-sm border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/50 transition-colors"
                      title="Activate offer"
                    >
                      <Play size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="px-3 py-2 text-sm border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Delete offer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {offer.status === 'active' && (
                <div className="px-6 py-3 bg-muted/50 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Public URL:</span>
                    <a
                      href={`/offer/${offer.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      /offer/{offer.slug}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <OfferCreationModeModal
        isOpen={showModeSelector}
        onClose={() => setShowModeSelector(false)}
        onSelectWizard={handleSelectWizard}
        onSelectBuilder={handleSelectBuilder}
      />

      {showTemplateGallery && (
        <TemplateGallery
          isModal={true}
          onClose={() => setShowTemplateGallery(false)}
          onSelectTemplate={handleTemplateSelect}
          onPreviewTemplate={setTemplatePreview}
          onCompareTemplates={setCompareTemplates}
        />
      )}

      {templatePreview && (
        <TemplatePreviewModal
          template={templatePreview}
          onClose={() => setTemplatePreview(null)}
          onUseTemplate={handleTemplateSelect}
        />
      )}

      {compareTemplates.length > 1 && (
        <TemplateComparisonModal
          templates={compareTemplates}
          onClose={() => setCompareTemplates([])}
          onSelectTemplate={handleTemplateSelect}
        />
      )}
    </div>
  );
}
