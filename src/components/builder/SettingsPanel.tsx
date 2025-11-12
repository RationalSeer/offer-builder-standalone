import { useState } from 'react';
import { Settings, Globe, DollarSign, Tag, Image, FileText, Clock, Languages, Code, Webhook, TestTube, Palette } from 'lucide-react';
import type { InhouseOffer, TrackingPixel, WebhookConfig } from '../../types/inhouseOffer';

interface SettingsPanelProps {
  offer: Partial<InhouseOffer>;
  onOfferChange: (updates: Partial<InhouseOffer>) => void;
}

type SettingsTab = 'basic' | 'tracking' | 'branding' | 'advanced' | 'ab-testing';

const VERTICALS = [
  'EDU', 'Insurance', 'Health', 'Finance', 'Home Services', 'Solar', 'Legal', 'Auto',
  'Real Estate', 'Medicare', 'Home Improvement', 'Debt Relief', 'Tax Relief',
  'Senior Services', 'Moving', 'Roofing', 'HVAC', 'Pest Control', 'Security Systems',
  'Internet Services',
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'slate' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'paused', label: 'Paused', color: 'amber' },
  { value: 'archived', label: 'Archived', color: 'rose' },
];

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const LOCALES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
  { value: 'es-MX', label: 'Spanish (Mexico)' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'it-IT', label: 'Italian' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
];

export function SettingsPanel({ offer, onOfferChange }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('basic');

  function generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  function handleNameChange(name: string) {
    const updates: Partial<InhouseOffer> = { name };
    if (!offer.slug || offer.slug === '') {
      updates.slug = generateSlugFromName(name);
    }
    onOfferChange(updates);
  }

  function handleSlugChange(slug: string) {
    const sanitizedSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
    onOfferChange({ slug: sanitizedSlug });
  }

  function addTrackingPixel() {
    const pixels = offer.tracking_pixels || [];
    const newPixel: TrackingPixel = {
      id: `pixel-${Date.now()}`,
      name: 'New Pixel',
      platform: 'facebook',
      pixelId: '',
      triggerOn: 'form_complete',
      enabled: true,
    };
    onOfferChange({ tracking_pixels: [...pixels, newPixel] });
  }

  function updateTrackingPixel(index: number, updates: Partial<TrackingPixel>) {
    const pixels = [...(offer.tracking_pixels || [])];
    pixels[index] = { ...pixels[index], ...updates };
    onOfferChange({ tracking_pixels: pixels });
  }

  function removeTrackingPixel(index: number) {
    const pixels = [...(offer.tracking_pixels || [])];
    pixels.splice(index, 1);
    onOfferChange({ tracking_pixels: pixels });
  }

  function addWebhook() {
    const webhooks = offer.webhooks || [];
    const newWebhook: WebhookConfig = {
      id: `webhook-${Date.now()}`,
      name: 'New Webhook',
      url: '',
      method: 'POST',
      triggerOn: 'form_complete',
      enabled: true,
      retryOnFailure: true,
      maxRetries: 3,
    };
    onOfferChange({ webhooks: [...webhooks, newWebhook] });
  }

  function updateWebhook(index: number, updates: Partial<WebhookConfig>) {
    const webhooks = [...(offer.webhooks || [])];
    webhooks[index] = { ...webhooks[index], ...updates };
    onOfferChange({ webhooks: webhooks });
  }

  function removeWebhook(index: number) {
    const webhooks = [...(offer.webhooks || [])];
    webhooks.splice(index, 1);
    onOfferChange({ webhooks: webhooks });
  }

  const previewUrl = offer.slug
    ? `${window.location.origin}/offer/${offer.slug}`
    : 'Set a slug to see preview URL';

  const tabs = [
    { id: 'basic' as const, label: 'Basic', icon: Settings },
    { id: 'tracking' as const, label: 'Tracking', icon: Globe },
    { id: 'branding' as const, label: 'Branding', icon: Palette },
    { id: 'advanced' as const, label: 'Advanced', icon: Code },
    { id: 'ab-testing' as const, label: 'A/B Test', icon: TestTube },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={14} className="inline mr-1.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {activeTab === 'basic' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Offer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={offer.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Education Degree Finder"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                URL Slug <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    /offer/
                  </span>
                  <input
                    type="text"
                    value={offer.slug || ''}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="education-degree-finder"
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Globe size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Public URL Preview
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 break-all">
                        {previewUrl}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Offer Thumbnail
              </label>
              <input
                type="url"
                value={offer.thumbnail_url || ''}
                onChange={(e) => onOfferChange({ thumbnail_url: e.target.value })}
                placeholder="https://example.com/thumbnail.jpg"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {offer.thumbnail_url && (
                <div className="mt-2">
                  <img
                    src={offer.thumbnail_url}
                    alt="Thumbnail preview"
                    className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Displayed in offers list (recommended: 400x300px)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Vertical <span className="text-rose-500">*</span>
              </label>
              <select
                value={offer.vertical || 'EDU'}
                onChange={(e) => onOfferChange({ vertical: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {VERTICALS.map((vertical) => (
                  <option key={vertical} value={vertical}>
                    {vertical}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => onOfferChange({ status: status.value as any })}
                    className={`px-3 py-2 text-sm rounded-lg transition-all border-2 ${
                      offer.status === status.value
                        ? status.color === 'green'
                          ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-600'
                          : status.color === 'amber'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-600'
                          : status.color === 'rose'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-600'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={offer.description || ''}
                onChange={(e) => onOfferChange({ description: e.target.value })}
                rows={3}
                placeholder="Brief description of this offer..."
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <DollarSign size={16} />
                Default Payout <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  value={offer.default_payout || 0}
                  onChange={(e) => onOfferChange({ default_payout: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Tag size={16} />
                Everflow Offer ID
              </label>
              <input
                type="text"
                value={offer.everflow_offer_id || ''}
                onChange={(e) => onOfferChange({ everflow_offer_id: e.target.value })}
                placeholder="e.g., 12345"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Clock size={16} />
                Timezone
              </label>
              <select
                value={offer.timezone || 'America/New_York'}
                onChange={(e) => onOfferChange({ timezone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Languages size={16} />
                Language
              </label>
              <select
                value={offer.locale || 'en-US'}
                onChange={(e) => onOfferChange({ locale: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {LOCALES.map((locale) => (
                  <option key={locale.value} value={locale.value}>
                    {locale.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <FileText size={16} />
                Compliance Notes
              </label>
              <textarea
                value={offer.compliance_notes || ''}
                onChange={(e) => onOfferChange({ compliance_notes: e.target.value })}
                rows={3}
                placeholder="TCPA disclosure requirements, state-specific regulations, etc..."
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Regulatory requirements and compliance notes
              </p>
            </div>
          </>
        )}

        {activeTab === 'tracking' && (
          <>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Add conversion tracking pixels that fire when users complete specific actions
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Tracking Pixels
                </h4>
                <button
                  onClick={addTrackingPixel}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Pixel
                </button>
              </div>

              <div className="space-y-3">
                {(offer.tracking_pixels || []).map((pixel, index) => (
                  <div
                    key={pixel.id}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={pixel.name}
                        onChange={(e) => updateTrackingPixel(index, { name: e.target.value })}
                        placeholder="Pixel Name"
                        className="flex-1 mr-2 px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={() => removeTrackingPixel(index)}
                        className="text-rose-600 hover:text-rose-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-2">
                      <select
                        value={pixel.platform}
                        onChange={(e) => updateTrackingPixel(index, { platform: e.target.value as any })}
                        className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="facebook">Facebook</option>
                        <option value="google">Google Ads</option>
                        <option value="tiktok">TikTok</option>
                        <option value="snapchat">Snapchat</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="twitter">Twitter</option>
                        <option value="pinterest">Pinterest</option>
                        <option value="custom">Custom</option>
                      </select>

                      <input
                        type="text"
                        value={pixel.pixelId}
                        onChange={(e) => updateTrackingPixel(index, { pixelId: e.target.value })}
                        placeholder="Pixel ID or Tag ID"
                        className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />

                      <select
                        value={pixel.triggerOn}
                        onChange={(e) => updateTrackingPixel(index, { triggerOn: e.target.value as any })}
                        className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="page_load">Page Load</option>
                        <option value="form_start">Form Start</option>
                        <option value="form_complete">Form Complete</option>
                        <option value="step_complete">Step Complete</option>
                      </select>

                      <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={pixel.enabled}
                          onChange={(e) => updateTrackingPixel(index, { enabled: e.target.checked })}
                          className="rounded"
                        />
                        Enabled
                      </label>
                    </div>
                  </div>
                ))}

                {(!offer.tracking_pixels || offer.tracking_pixels.length === 0) && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    No tracking pixels configured
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'branding' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Image size={16} />
                Company Logo
              </label>
              <input
                type="url"
                value={offer.config?.branding?.logo || ''}
                onChange={(e) => onOfferChange({
                  config: {
                    ...offer.config,
                    branding: {
                      ...offer.config?.branding,
                      logo: e.target.value,
                    },
                  },
                })}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {offer.config?.branding?.logo && (
                <div className="mt-2">
                  <img
                    src={offer.config.branding.logo}
                    alt="Logo preview"
                    className="h-16 object-contain rounded-lg border border-slate-200 dark:border-slate-700 p-2 bg-white dark:bg-slate-900"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={offer.config?.branding?.companyName || ''}
                onChange={(e) => onOfferChange({
                  config: {
                    ...offer.config,
                    branding: {
                      ...offer.config?.branding,
                      companyName: e.target.value,
                    },
                  },
                })}
                placeholder="Your Company Name"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Favicon URL
              </label>
              <input
                type="url"
                value={offer.config?.branding?.favicon || ''}
                onChange={(e) => onOfferChange({
                  config: {
                    ...offer.config,
                    branding: {
                      ...offer.config?.branding,
                      favicon: e.target.value,
                    },
                  },
                })}
                placeholder="https://example.com/favicon.ico"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        {activeTab === 'advanced' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Code size={16} />
                Custom CSS
              </label>
              <textarea
                value={offer.config?.customCss || ''}
                onChange={(e) => onOfferChange({
                  config: {
                    ...offer.config,
                    customCss: e.target.value,
                  },
                })}
                rows={8}
                placeholder=".custom-class { color: blue; }"
                className="w-full px-3 py-2 font-mono text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Code size={16} />
                Custom JavaScript
              </label>
              <textarea
                value={offer.config?.customJs || ''}
                onChange={(e) => onOfferChange({
                  config: {
                    ...offer.config,
                    customJs: e.target.value,
                  },
                })}
                rows={8}
                placeholder="console.log('Custom script');"
                className="w-full px-3 py-2 font-mono text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Webhook size={16} />
                  Webhooks
                </h4>
                <button
                  onClick={addWebhook}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Webhook
                </button>
              </div>

              <div className="space-y-3">
                {(offer.webhooks || []).map((webhook, index) => (
                  <div
                    key={webhook.id}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={webhook.name}
                        onChange={(e) => updateWebhook(index, { name: e.target.value })}
                        placeholder="Webhook Name"
                        className="flex-1 mr-2 px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={() => removeWebhook(index)}
                        className="text-rose-600 hover:text-rose-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="url"
                        value={webhook.url}
                        onChange={(e) => updateWebhook(index, { url: e.target.value })}
                        placeholder="https://api.example.com/webhook"
                        className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={webhook.method}
                          onChange={(e) => updateWebhook(index, { method: e.target.value as any })}
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="POST">POST</option>
                          <option value="GET">GET</option>
                          <option value="PUT">PUT</option>
                        </select>

                        <select
                          value={webhook.triggerOn}
                          onChange={(e) => updateWebhook(index, { triggerOn: e.target.value as any })}
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="form_start">Form Start</option>
                          <option value="form_complete">Form Complete</option>
                          <option value="lead_created">Lead Created</option>
                          <option value="lead_accepted">Lead Accepted</option>
                          <option value="lead_rejected">Lead Rejected</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={webhook.enabled}
                            onChange={(e) => updateWebhook(index, { enabled: e.target.checked })}
                            className="rounded"
                          />
                          Enabled
                        </label>

                        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={webhook.retryOnFailure}
                            onChange={(e) => updateWebhook(index, { retryOnFailure: e.target.checked })}
                            className="rounded"
                          />
                          Retry on failure
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                {(!offer.webhooks || offer.webhooks.length === 0) && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    No webhooks configured
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'ab-testing' && (
          <>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Split traffic between different versions of your offer to optimize performance
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Enable A/B Testing
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Test different versions of this offer
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={offer.ab_testing?.enabled || false}
                  onChange={(e) => onOfferChange({
                    ab_testing: {
                      ...offer.ab_testing,
                      enabled: e.target.checked,
                      variants: offer.ab_testing?.variants || [],
                      trafficSplitMethod: offer.ab_testing?.trafficSplitMethod || 'even',
                      winnerMetric: offer.ab_testing?.winnerMetric || 'conversion_rate',
                    },
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {offer.ab_testing?.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Traffic Split Method
                  </label>
                  <select
                    value={offer.ab_testing?.trafficSplitMethod || 'even'}
                    onChange={(e) => onOfferChange({
                      ab_testing: {
                        ...offer.ab_testing,
                        trafficSplitMethod: e.target.value as any,
                      },
                    })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="even">Even Split</option>
                    <option value="weighted">Weighted Distribution</option>
                    <option value="manual">Manual Control</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Winner Metric
                  </label>
                  <select
                    value={offer.ab_testing?.winnerMetric || 'conversion_rate'}
                    onChange={(e) => onOfferChange({
                      ab_testing: {
                        ...offer.ab_testing,
                        winnerMetric: e.target.value as any,
                      },
                    })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="conversion_rate">Conversion Rate</option>
                    <option value="revenue">Total Revenue</option>
                    <option value="completion_rate">Completion Rate</option>
                    <option value="time_to_complete">Time to Complete</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    A/B testing variants will be managed from the dedicated A/B Testing section. Configure your test variations there.
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
