import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import type { PageSection } from '../../types/pageBuilder';

interface ContentEditorPanelProps {
  section: PageSection | null;
  onContentChange: (sectionId: string, content: any) => void;
}

export function ContentEditorPanel({ section, onContentChange }: ContentEditorPanelProps) {
  if (!section) {
    return (
      <Card className="h-full">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Select a section to edit its content</p>
        </CardContent>
      </Card>
    );
  }

  const updateField = (field: string, value: any) => {
    const newContent = { ...section.content, [field]: value };
    onContentChange(section.id, newContent);
  };

  const updateArrayItem = (arrayName: string, index: number, field: string, value: any) => {
    const array = section.content[arrayName] || [];
    const newArray = [...array];
    newArray[index] = { ...newArray[index], [field]: value };
    updateField(arrayName, newArray);
  };

  const addArrayItem = (arrayName: string, template: any) => {
    const array = section.content[arrayName] || [];
    const newArray = [...array, { ...template, id: Date.now().toString() }];
    updateField(arrayName, newArray);
  };

  const removeArrayItem = (arrayName: string, index: number) => {
    const array = section.content[arrayName] || [];
    const newArray = array.filter((_: any, i: number) => i !== index);
    updateField(arrayName, newArray);
  };

  const renderBasicFields = () => (
    <div className="space-y-4">
      {section.content.title !== undefined && (
        <div>
          <label className="text-xs font-medium mb-1 block">Title</label>
          <input
            type="text"
            value={section.content.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
            placeholder="Section title"
          />
        </div>
      )}

      {section.content.subtitle !== undefined && (
        <div>
          <label className="text-xs font-medium mb-1 block">Subtitle</label>
          <input
            type="text"
            value={section.content.subtitle || ''}
            onChange={(e) => updateField('subtitle', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
            placeholder="Section subtitle"
          />
        </div>
      )}

      {section.content.description !== undefined && (
        <div>
          <label className="text-xs font-medium mb-1 block">Description</label>
          <textarea
            value={section.content.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
            rows={3}
            placeholder="Section description"
          />
        </div>
      )}

      {section.content.buttonText !== undefined && (
        <div>
          <label className="text-xs font-medium mb-1 block">Button Text</label>
          <input
            type="text"
            value={section.content.buttonText || ''}
            onChange={(e) => updateField('buttonText', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
            placeholder="Click here"
          />
        </div>
      )}

      {section.content.buttonLink !== undefined && (
        <div>
          <label className="text-xs font-medium mb-1 block">Button Link</label>
          <input
            type="text"
            value={section.content.buttonLink || ''}
            onChange={(e) => updateField('buttonLink', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
            placeholder="#section"
          />
        </div>
      )}

      {section.content.imageUrl !== undefined && (
        <div>
          <label className="text-xs font-medium mb-1 block">Image URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={section.content.imageUrl || ''}
              onChange={(e) => updateField('imageUrl', e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-border rounded bg-background"
              placeholder="https://example.com/image.jpg"
            />
            <Button size="sm" variant="secondary">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
          {section.content.imageUrl && (
            <img
              src={section.content.imageUrl}
              alt="Preview"
              className="mt-2 w-full h-32 object-cover rounded border border-border"
            />
          )}
        </div>
      )}

      {section.content.videoUrl !== undefined && (
        <div>
          <label className="text-xs font-medium mb-1 block">Video URL</label>
          <input
            type="text"
            value={section.content.videoUrl || ''}
            onChange={(e) => updateField('videoUrl', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
            placeholder="https://www.youtube.com/embed/..."
          />
        </div>
      )}
    </div>
  );

  const renderArrayFields = () => {
    if (!section.content.items) return null;

    const items = section.content.items || [];
    const itemTemplate = getItemTemplate();

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium">Items ({items.length})</label>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addArrayItem('items', itemTemplate)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items.map((item: any, index: number) => (
            <div key={item.id || index} className="p-3 border border-border rounded bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Item {index + 1}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeArrayItem('items', index)}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-2">
                {Object.keys(item).filter((key) => key !== 'id').map((key) => (
                  <div key={key}>
                    <label className="text-xs text-muted-foreground capitalize mb-1 block">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {typeof item[key] === 'string' && item[key].length > 50 ? (
                      <textarea
                        value={item[key] || ''}
                        onChange={(e) => updateArrayItem('items', index, key, e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-border rounded bg-background"
                        rows={2}
                      />
                    ) : Array.isArray(item[key]) ? (
                      <textarea
                        value={item[key].join('\n')}
                        onChange={(e) => updateArrayItem('items', index, key, e.target.value.split('\n'))}
                        className="w-full px-2 py-1 text-xs border border-border rounded bg-background font-mono"
                        rows={3}
                        placeholder="One item per line"
                      />
                    ) : (
                      <input
                        type="text"
                        value={item[key] || ''}
                        onChange={(e) => updateArrayItem('items', index, key, e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-border rounded bg-background"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getItemTemplate = () => {
    const type = section.type;

    if (type.includes('features')) {
      return { icon: 'check', title: 'New Feature', description: 'Feature description' };
    } else if (type.includes('testimonial')) {
      return { name: 'John Doe', quote: 'This is amazing!', rating: 5 };
    } else if (type.includes('pricing')) {
      return { name: 'Basic', price: '$9', period: '/month', features: ['Feature 1', 'Feature 2'] };
    } else if (type.includes('faq')) {
      return { question: 'New question?', answer: 'Answer here' };
    } else if (type.includes('stats')) {
      return { number: '100', suffix: '+', label: 'Label' };
    } else if (type.includes('process')) {
      return { step: '1', title: 'Step Title', description: 'Step description' };
    } else {
      return { title: 'New Item', description: 'Item description' };
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Content Editor</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Editing: {section.type}
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-6">
        {renderBasicFields()}
        {renderArrayFields()}
      </CardContent>
    </Card>
  );
}
