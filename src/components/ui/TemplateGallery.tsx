import { useState, useEffect } from 'react';
import { Search, Grid, List, TrendingUp, Award, Clock, DollarSign, ChevronDown, X, Eye, CheckCircle } from 'lucide-react';
import { WizardTemplate } from '../types/dynamicContent';
import { getWizardTemplates, incrementTemplateUsage } from '../services/wizardTemplateService';
import { Button } from './Button';

interface TemplateGalleryProps {
  onSelectTemplate?: (template: WizardTemplate) => void;
  onPreviewTemplate?: (template: WizardTemplate) => void;
  onCompareTemplates?: (templates: WizardTemplate[]) => void;
  isModal?: boolean;
  onClose?: () => void;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'popular' | 'newest' | 'name' | 'conversion';

export function TemplateGallery({
  onSelectTemplate,
  onPreviewTemplate,
  onCompareTemplates,
  isModal = false,
  onClose,
}: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<WizardTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WizardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVertical, setSelectedVertical] = useState<string>('all');
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [availableVerticals, setAvailableVerticals] = useState<string[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterAndSortTemplates();
  }, [templates, searchQuery, selectedVertical, selectedGoal, sortBy]);

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

  function filterAndSortTemplates() {
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

    if (selectedGoal !== 'all') {
      filtered = filtered.filter(t => t.goal === selectedGoal);
    }

    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'conversion':
        filtered.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
        break;
    }

    setFilteredTemplates(filtered);
  }

  async function handleSelectTemplate(template: WizardTemplate) {
    await incrementTemplateUsage(template.id);
    onSelectTemplate?.(template);
  }

  function toggleCompareSelection(templateId: string) {
    setSelectedForComparison(prev => {
      if (prev.includes(templateId)) {
        return prev.filter(id => id !== templateId);
      } else if (prev.length < 3) {
        return [...prev, templateId];
      }
      return prev;
    });
  }

  function handleCompare() {
    const templatesToCompare = templates.filter(t => selectedForComparison.includes(t.id));
    onCompareTemplates?.(templatesToCompare);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isModal ? '' : 'container mx-auto px-4 py-8'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold">Template Gallery</h1>
            <p className="text-muted-foreground mt-1">
              Browse {templates.length} professional templates for high-converting lead capture
            </p>
          </div>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Industry Filter */}
          <select
            value={selectedVertical}
            onChange={(e) => setSelectedVertical(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Industries</option>
            {availableVerticals.map(vertical => (
              <option key={vertical} value={vertical}>{vertical}</option>
            ))}
          </select>

          {/* Goal Filter */}
          <select
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Goals</option>
            <option value="lead_gen">Lead Generation</option>
            <option value="qualification">Qualification</option>
            <option value="survey">Survey</option>
            <option value="quiz">Quiz</option>
          </select>
        </div>

        {/* Sort and View Controls */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="name">Name</option>
              <option value="conversion">Highest Conversion</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {selectedForComparison.length > 0 && (
              <Button
                onClick={handleCompare}
                disabled={selectedForComparison.length < 2}
                className="mr-2"
              >
                Compare ({selectedForComparison.length})
              </Button>
            )}
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-secondary'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-secondary'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTemplates.length} of {templates.length} templates
        </p>
      </div>

      {/* Templates Grid/List */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-card border rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search query
          </p>
          <Button onClick={() => {
            setSearchQuery('');
            setSelectedVertical('all');
            setSelectedGoal('all');
          }}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              viewMode={viewMode}
              icon={verticalIcons[template.vertical] || '📄'}
              isSelected={selectedForComparison.includes(template.id)}
              onSelect={() => handleSelectTemplate(template)}
              onPreview={() => onPreviewTemplate?.(template)}
              onToggleCompare={() => toggleCompareSelection(template.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: WizardTemplate;
  viewMode: ViewMode;
  icon: string;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onToggleCompare: () => void;
}

function TemplateCard({ template, viewMode, icon, isSelected, onSelect, onPreview, onToggleCompare }: TemplateCardProps) {
  const stepCount = template.suggested_steps?.length || 0;
  const estimatedTime = Math.ceil(stepCount * 15);

  if (viewMode === 'list') {
    return (
      <div className="bg-card border rounded-lg p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{icon}</span>
              <div>
                <h3 className="text-lg font-semibold">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.vertical}</p>
              </div>
              {template.popularity_score && template.popularity_score > 50 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  Popular
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {stepCount} steps
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                ~{estimatedTime}s
              </span>
              {template.popularity_score && (
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Used {template.popularity_score} times
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleCompare}
              className="w-5 h-5 rounded border-gray-300"
            />
            <Button onClick={onPreview} variant="secondary" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button onClick={onSelect} size="sm">
              Use Template
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow relative">
      <div className="absolute top-4 right-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleCompare}
          className="w-5 h-5 rounded border-gray-300"
        />
      </div>

      <div className="text-center mb-4">
        <span className="text-5xl">{icon}</span>
      </div>

      <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
      <p className="text-sm text-blue-600 mb-3">{template.vertical}</p>

      {template.popularity_score && template.popularity_score > 50 && (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full mb-3">
          <TrendingUp className="w-3 h-3" />
          Popular
        </span>
      )}

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{template.description}</p>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Steps:</span>
          <span className="font-medium">{stepCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Est. Time:</span>
          <span className="font-medium">~{estimatedTime} seconds</span>
        </div>
        {template.popularity_score && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Used:</span>
            <span className="font-medium">{template.popularity_score} times</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={onPreview} variant="secondary" className="flex-1">
          Preview
        </Button>
        <Button onClick={onSelect} className="flex-1">
          Use Template
        </Button>
      </div>
    </div>
  );
}
