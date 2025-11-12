import { useState } from 'react';
import { Plus, Search, Star, Crown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { sectionLibraryData, sectionCategories } from '../../data/sectionLibrary';
import { PageSection } from '../../types/pageBuilder';

interface SectionLibraryPanelProps {
  onAddSection: (section: PageSection) => void;
}

export function SectionLibraryPanel({ onAddSection }: SectionLibraryPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filteredSections = sectionLibraryData.filter((section) => {
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorites = selectedCategory !== 'favorites' || favorites.has(section.id);

    return matchesCategory && matchesSearch && matchesFavorites;
  });

  const toggleFavorite = (sectionId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(sectionId)) {
      newFavorites.delete(sectionId);
    } else {
      newFavorites.add(sectionId);
    }
    setFavorites(newFavorites);
  };

  const handleAddSection = (section: typeof sectionLibraryData[0]) => {
    const newSection: PageSection = {
      ...section.default_config,
      id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    onAddSection(newSection);
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')];
    return Icon || LucideIcons.Square;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Section Library</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sections..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </CardHeader>

      <div className="px-4 pb-3 border-b border-border overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('favorites')}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1 ${
              selectedCategory === 'favorites'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            <Star className="h-3 w-3" />
            Favorites
          </button>
          {sectionCategories.map((cat) => {
            const Icon = getIcon(cat.icon);
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                <Icon className="h-3 w-3" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      <CardContent className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredSections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No sections found
          </div>
        ) : (
          filteredSections.map((section) => {
            const Icon = getIcon(section.icon);
            const isFavorite = favorites.has(section.id);

            return (
              <div
                key={section.id}
                className="group p-3 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all cursor-pointer relative"
                onClick={() => handleAddSection(section)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(section.id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-background transition-colors"
                >
                  <Star
                    className={`h-3.5 w-3.5 ${
                      isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                    }`}
                  />
                </button>

                <div className="flex items-start gap-3 pr-6">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{section.name}</h4>
                      {section.is_premium && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          <Crown className="h-3 w-3 text-yellow-600" />
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-full px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded flex items-center justify-center gap-1">
                    <Plus className="h-3 w-3" />
                    Add Section
                  </button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
