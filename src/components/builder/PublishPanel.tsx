import { useState, useEffect } from 'react';
import { Globe, Calendar, Clock, ExternalLink, Copy, Check } from 'lucide-react';
import type { InhouseOffer } from '../../types/inhouseOffer';
import type { getOfferVersions, publishOfferVersion } from '../../services/offerTemplateService';

interface PublishPanelProps {
  offerId: string;
  offer: InhouseOffer;
  onOpenSEO?: () => void;
}

export function PublishPanel({ offerId, offer, onOpenSEO }: PublishPanelProps) {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [offerId]);

  async function loadVersions() {
    try {
      setLoading(true);
      const data = await getOfferVersions(offerId);
      setVersions(data);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!versions.length) {
      alert('Please save the offer first to create a version.');
      return;
    }

    const latestVersion = versions[0];
    const publishUrl = `/offer/${offer.slug}`;

    try {
      await publishOfferVersion(latestVersion.id, publishUrl);
      alert('Offer published successfully!');
      loadVersions();
    } catch (error) {
      alert('Failed to publish offer');
      console.error(error);
    }
  }

  function copyUrl() {
    const url = `${window.location.origin}/offer/${offer.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  const publishedVersion = versions.find(v => v.published_status === 'published');

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
        <div className="flex items-start gap-3">
          <Globe size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Publishing Status
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {offer.is_published
                ? 'This offer is live and accepting submissions'
                : 'This offer is in draft mode and not publicly accessible'}
            </p>
          </div>
        </div>
      </div>

      {offer.is_published && publishedVersion && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Public URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/offer/${offer.slug}`}
              className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <button
              onClick={copyUrl}
              className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Copy URL"
            >
              {copiedUrl ? (
                <Check size={18} className="text-green-600" />
              ) : (
                <Copy size={18} className="text-slate-600 dark:text-slate-400" />
              )}
            </button>
            <a
              href={`/offer/${offer.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={18} className="text-slate-600 dark:text-slate-400" />
            </a>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          URL Slug
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {window.location.origin}/offer/
          </span>
          <input
            type="text"
            readOnly
            value={offer.slug}
            className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          To change the URL slug, update it in the offer settings
        </p>
      </div>

      <div>
        <button
          onClick={handlePublish}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Globe size={18} />
          {offer.is_published ? 'Update Published Version' : 'Publish Offer'}
        </button>
      </div>

      {versions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Version History
          </h3>
          <div className="space-y-2">
            {versions.slice(0, 5).map((version) => (
              <div
                key={version.id}
                className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Version {version.version_number}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      version.published_status === 'published'
                        ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                        : version.published_status === 'scheduled'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {version.published_status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(version.created_at).toLocaleDateString()}
                  </div>
                  {version.published_at && (
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      Published {new Date(version.published_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
          SEO Settings
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Configure meta tags, Open Graph images, and other SEO settings for better search visibility.
        </p>
        <button
          onClick={onOpenSEO}
          className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Configure SEO →
        </button>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
          Custom Domain
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Use your own domain name instead of the default subdomain for a professional appearance.
        </p>
        <button className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Add Custom Domain →
        </button>
      </div>
    </div>
  );
}
