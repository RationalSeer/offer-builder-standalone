import { useState, useMemo } from 'react';
import { Search, X, TrendingUp, Sparkles, Filter } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { StepTemplate } from '../../types/stepTemplate';
import {
  STEP_TEMPLATES,
  STEP_TEMPLATE_CATEGORIES,
  STEP_TEMPLATE_VERTICALS,
  getTemplatesByVertical,
  getTemplatesByCategory,
  searchTemplates,
  getPopularTemplates,
} from '../../data/stepTemplates';

interface StepTemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: StepTemplate) => void;
  currentVertical?: string;
}

export function StepTemplateGallery({
  isOpen,
  onClose,
  onSelectTemplate,
  currentVertical = 'all',
}: StepTemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVertical, setSelectedVertical] = useState(currentVertical.toLowerCase());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<StepTemplate | null>(null);

  const filteredTemplates = useMemo(() => {
    let templates = STEP_TEMPLATES;

    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery);
    } else {
      if (selectedVertical !== 'all') {
        templates = getTemplatesByVertical(selectedVertical);
      }
      if (selectedCategory !== 'all') {
        templates = templates.filter(t => t.category === selectedCategory);
      }
    }

    return templates.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }, [searchQuery, selectedVertical, selectedCategory]);

  const popularTemplates = useMemo(() => getPopularTemplates(5), []);

  function handleSelectTemplate(template: StepTemplate) {
    onSelectTemplate(template);
    onClose();
  }

  function getIconComponent(iconName?: string) {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon size={20} /> : null;
  }

  function getCategoryIcon(iconName: string) {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon size={16} /> : null;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-blue-600" size={24} />
              Step Template Gallery
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Choose from {STEP_TEMPLATES.length}+ pre-built, high-converting step templates
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search templates by name, description, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Vertical
              </label>
              <select
                value={selectedVertical}
                onChange={(e) => setSelectedVertical(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STEP_TEMPLATE_VERTICALS.map((vertical) => (
                  <option key={vertical.id} value={vertical.id}>
                    {vertical.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STEP_TEMPLATE_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!searchQuery && (
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Popular Templates:
              </span>
              {popularTemplates.slice(0, 3).map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="px-3 py-1 text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
                >
                  {template.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="mx-auto mb-4 text-slate-400" size={48} />
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                No templates found
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getIconComponent(template.icon) && (
                        <div className="p-2 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
                          {getIconComponent(template.icon)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                          {template.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {template.stepType.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    {template.popularity && template.popularity > 85 && (
                      <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-full flex items-center gap-1">
                        <TrendingUp size={12} />
                        Popular
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                      {STEP_TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.name}
                    </span>
                    {template.avgCompletionRate && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {template.avgCompletionRate}% CVR
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTemplate(template);
                    }}
                    className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium opacity-0 group-hover:opacity-100"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {previewTemplate && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Preview: {previewTemplate.name}
                </h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Description
                  </label>
                  <p className="text-slate-900 dark:text-white">{previewTemplate.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Question
                  </label>
                  <p className="text-slate-900 dark:text-white font-medium">
                    {previewTemplate.questionText}
                  </p>
                </div>

                {previewTemplate.options && previewTemplate.options.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Options
                    </label>
                    <div className="space-y-2">
                      {previewTemplate.options.map((option, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white"
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previewTemplate.helpText && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Help Text
                    </label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {previewTemplate.helpText}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Field Mapping
                    </label>
                    <p className="text-sm text-slate-900 dark:text-white font-mono">
                      {previewTemplate.fieldMapping || 'None'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Step Type
                    </label>
                    <p className="text-sm text-slate-900 dark:text-white">
                      {previewTemplate.stepType.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {previewTemplate.validationRules && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Validation
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {previewTemplate.validationRules.required && (
                        <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 rounded">
                          Required
                        </span>
                      )}
                      {previewTemplate.validationRules.minLength && (
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded">
                          Min: {previewTemplate.validationRules.minLength}
                        </span>
                      )}
                      {previewTemplate.validationRules.maxLength && (
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded">
                          Max: {previewTemplate.validationRules.maxLength}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {previewTemplate.tags && previewTemplate.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Tags
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {previewTemplate.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {previewTemplate.avgCompletionRate && (
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        Average Completion Rate
                      </span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {previewTemplate.avgCompletionRate}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSelectTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Use This Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
