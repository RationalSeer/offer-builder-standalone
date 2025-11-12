import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

interface SEOModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    title?: string;
    description?: string;
    ogImage?: string;
    keywords?: string[];
  };
  onSave: (seoData: {
    title: string;
    description: string;
    ogImage: string;
    keywords: string[];
  }) => void;
}

export function SEOModal({ isOpen, onClose, initialData, onSave }: SEOModalProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [ogImage, setOgImage] = useState(initialData?.ogImage || '');
  const [keywords, setKeywords] = useState(initialData?.keywords?.join(', ') || '');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setOgImage(initialData.ogImage || '');
      setKeywords(initialData.keywords?.join(', ') || '');
    }
  }, [initialData]);

  if (!isOpen) return null;

  function handleSave() {
    onSave({
      title,
      description,
      ogImage,
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">SEO Configuration</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your Offer Title - Brand Name"
              maxLength={60}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {title.length}/60 characters (optimal: 50-60)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Meta Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your offer that will appear in search results"
              maxLength={160}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {description.length}/160 characters (optimal: 150-160)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Open Graph Image URL
            </label>
            <div className="space-y-2">
              <input
                type="url"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              {ogImage && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                  <img
                    src={ogImage}
                    alt="OG Preview"
                    className="w-full h-auto max-h-48 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recommended size: 1200x630px. This image will appear when your offer is shared on social media.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Keywords
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Comma-separated keywords relevant to your offer
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              SEO Tips
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Include your main keyword in the title</li>
              <li>• Write a compelling description that encourages clicks</li>
              <li>• Use high-quality, relevant images for social sharing</li>
              <li>• Keep titles under 60 characters to avoid truncation</li>
              <li>• Make descriptions 150-160 characters for best results</li>
            </ul>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save SEO Settings
          </button>
        </div>
      </div>
    </div>
  );
}
