import { useState, useEffect } from 'react';
import { Search, X, Eye, CheckCircle, Clock, Award, BookOpen } from 'lucide-react';
import type { WizardTemplate } from '../../types/dynamicContent';
import { getWizardTemplates, incrementTemplateUsage } from '../../services/wizardTemplateService';
import { Button } from './Button';
import { TemplatePreviewModal } from './TemplatePreviewModal';

interface TemplateQuickSelectorProps {
  onSelectTemplate: (template: WizardTemplate) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export function TemplateQuickSelector({ onSelectTemplate, onClose, isModal = false }: TemplateQuickSelectorProps) {
  const [templates, setTemplates] = useState<WizardTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WizardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVertical, setSelectedVertical] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<WizardTemplate | null>(null);
  const [availableVerticals, setAvailableVerticals] = useState<string[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedVertical]);

  async function loadTemplates() {
    try {
      setLoading(true);
      const data = await getWizardTemplates();
      setTemplates(data);

      const verticals = Array.from(new Set(data.map(t => t.vertical))).sort();
      setAvailableVerticals(verticals);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterTemplates() {
    let filtered = [...templates];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t => t.name.toLowerCase().includes(query) ||
             t.description.toLowerCase().includes(query) ||
             t.vertical.toLowerCase().includes(query)
      );
    }

    if (selectedVertical !== 'all') {
      filtered = filtered.filter(t => t.vertical === selectedVertical);
    }

    filtered.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));

    setFilteredTemplates(filtered);
  }

  async function handleSelectTemplate(template: WizardTemplate) {
    await incrementTemplateUsage(template.id);
    onSelectTemplate(template);
  }

  const verticalIcons: Record<string, string> = {
    'EDU': '🎓',
    'Education': '🎓',
    'SSD': '🛡️',
    'Solar': '☀️',
    'Insurance': '🚗',
    'Auto Insurance': '🚗',
    'Home Insurance': '🏠',
    'Life Insurance': '💰',
    'Health Insurance': '🏥',
    'Finance': '💵',
    'Loans': '💵',
    'Mortgage': '🏡',
    'Debt': '💳',
    'Home Services': '🔧',
    'Medicare': '🏥',
    'Business': '💼',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  const content = (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={selectedVertical}
          onChange={(e) => setSelectedVertical(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Industries ({templates.length})</option>
          {availableVerticals.map(vertical => {
            const count = templates.filter(t => t.vertical === vertical).length;
            return (
              <option key={vertical} value={vertical}>
                {vertical} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {/* Results */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No templates found</p>
          <Button onClick={() => { setSearchQuery(''); setSelectedVertical('all'); }} className="mt-3">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {filteredTemplates.map(template => {
            const stepCount = template.suggested_steps?.length || 0;
            const estimatedTime = Math.ceil(stepCount * 15);

            return (
              <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{verticalIcons[template.vertical] || '📄'}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{template.name}</h4>
                    <p className="text-sm text-blue-600 mb-2">{template.vertical}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{template.description}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {stepCount} steps
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{estimatedTime}s
                      </span>
                      {template.popularity_score && template.popularity_score > 0 && (
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {template.popularity_score} uses
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setPreviewTemplate(template)}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        onClick={() => handleSelectTemplate(template)}
                        size="sm"
                        className="flex-1"
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUseTemplate={handleSelectTemplate}
        />
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">Load Template</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a professional template to get started faster
              </p>
            </div>
            {onClose && (
              <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-auto p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
}
