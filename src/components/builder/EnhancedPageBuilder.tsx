import { useState, useCallback } from 'react';
import {
  GripVertical,
  Trash2,
  Eye,
  Save,
  ArrowUp,
  ArrowDown,
  Copy,
  Settings,
  Smartphone,
  Monitor,
  Tablet,
  Undo,
  Redo,
  Lock,
  Unlock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SectionLibraryPanel } from './SectionLibraryPanel';
import { StylePanel } from './StylePanel';
import { ContentEditorPanel } from './ContentEditorPanel';
import { PageSection, ElementStyle } from '../../types/pageBuilder';
import { SectionRenderer } from '../../components/renderer/SectionRenderer';
import { cn } from '../../lib/utils';

interface EnhancedPageBuilderProps {
  initialSections?: PageSection[];
  onSave?: (sections: PageSection[]) => void;
}

export function EnhancedPageBuilder({ initialSections = [], onSave }: EnhancedPageBuilderProps) {
  const [sections, setSections] = useState<PageSection[]>(initialSections);
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [history, setHistory] = useState<PageSection[][]>([initialSections]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [rightPanelTab, setRightPanelTab] = useState<'content' | 'style'>('content');
  const [isSaving, setIsSaving] = useState(false);

  const addToHistory = useCallback((newSections: PageSection[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSections);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSections(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSections(history[historyIndex + 1]);
    }
  };

  const addSection = (section: PageSection) => {
    const newSections = [...sections, section];
    setSections(newSections);
    addToHistory(newSections);
  };

  const removeSection = (id: string) => {
    const newSections = sections.filter((s) => s.id !== id);
    setSections(newSections);
    addToHistory(newSections);
    if (selectedSection?.id === id) {
      setSelectedSection(null);
    }
  };

  const duplicateSection = (section: PageSection) => {
    const newSection: PageSection = {
      ...section,
      id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    const index = sections.findIndex((s) => s.id === section.id);
    const newSections = [...sections];
    newSections.splice(index + 1, 0, newSection);
    setSections(newSections);
    addToHistory(newSections);
  };

  const moveSection = (fromIndex: number, toIndex: number) => {
    const newSections = [...sections];
    const [removed] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, removed);
    setSections(newSections);
    addToHistory(newSections);
  };

  const moveSectionUp = (index: number) => {
    if (index > 0) {
      moveSection(index, index - 1);
    }
  };

  const moveSectionDown = (index: number) => {
    if (index < sections.length - 1) {
      moveSection(index, index + 1);
    }
  };

  const toggleSectionLock = (id: string) => {
    const newSections = sections.map((section) =>
      section.id === id ? { ...section, locked: !section.locked } : section
    );
    setSections(newSections);
    addToHistory(newSections);
  };

  const toggleSectionVisibility = (id: string) => {
    const newSections = sections.map((section) =>
      section.id === id ? { ...section, visible: !section.visible } : section
    );
    setSections(newSections);
    addToHistory(newSections);
  };

  const updateSectionStyle = (id: string, style: ElementStyle) => {
    const newSections = sections.map((section) =>
      section.id === id ? { ...section, style } : section
    );
    setSections(newSections);
    addToHistory(newSections);
  };

  const updateSectionContent = (id: string, content: any) => {
    const newSections = sections.map((section) =>
      section.id === id ? { ...section, content } : section
    );
    setSections(newSections);
    addToHistory(newSections);
    if (selectedSection?.id === id) {
      setSelectedSection({ ...selectedSection, content });
    }
  };

  const handleDragStart = (index: number) => {
    const section = sections[index];
    if (!section.locked) {
      setDraggedItem(index);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== index) {
      moveSection(draggedItem, index);
      setDraggedItem(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(sections);
      } catch (error) {
        console.error('Error in handleSave:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getDeviceClass = () => {
    switch (deviceView) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'max-w-full';
    }
  };

  const deviceIcons = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  };

  if (previewMode) {
    return (
      <div className="h-full bg-muted/30">
        <div className="sticky top-0 z-10 bg-background border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold">Preview Mode</h3>
            <div className="flex gap-1 border border-border rounded p-1">
              {(['desktop', 'tablet', 'mobile'] as const).map((device) => {
                const Icon = deviceIcons[device];
                return (
                  <button
                    key={device}
                    onClick={() => setDeviceView(device)}
                    className={cn(
                      'p-2 rounded transition-colors',
                      deviceView === device
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                    title={device}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
          <Button variant="secondary" onClick={() => setPreviewMode(false)}>
            Exit Preview
          </Button>
        </div>
        <div className="p-8 overflow-auto h-[calc(100vh-80px)]">
          <div className={cn('mx-auto bg-white shadow-2xl', getDeviceClass())}>
            {sections
              .filter((s) => s.visible !== false)
              .map((section) => (
                <SectionRenderer
                  key={section.id}
                  section={section}
                  isEditing={false}
                />
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="border-b border-border p-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold">Page Builder</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={historyIndex === 0}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPreviewMode(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Page'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-border overflow-hidden">
          <SectionLibraryPanel onAddSection={addSection} />
        </div>

        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          {sections.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <Card className="max-w-md text-center p-12">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-bold mb-2">Start Building</h3>
                <p className="text-muted-foreground">
                  Add sections from the library on the left to start creating your landing page
                </p>
              </Card>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-3">
              {sections.map((section, index) => {
                const isSelected = selectedSection?.id === section.id;
                const isLocked = section.locked;
                const isHidden = section.visible === false;

                return (
                  <div
                    key={section.id}
                    draggable={!isLocked}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'group relative rounded-lg border-2 transition-all overflow-hidden',
                      isSelected ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50',
                      draggedItem === index && 'opacity-50',
                      isHidden && 'opacity-40',
                      isLocked && 'cursor-not-allowed'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded shadow-lg">
                        Selected
                      </div>
                    )}

                    <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-lg">
                      {!isLocked && (
                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          className="p-1.5 cursor-move text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                          title="Drag to reorder"
                        >
                          <GripVertical className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSectionUp(index);
                        }}
                        disabled={index === 0 || isLocked}
                        className="p-1.5 rounded hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSectionDown(index);
                        }}
                        disabled={index === sections.length - 1 || isLocked}
                        className="p-1.5 rounded hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateSection(section);
                        }}
                        className="p-1.5 rounded hover:bg-accent transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSectionLock(section.id);
                        }}
                        className="p-1.5 rounded hover:bg-accent transition-colors"
                        title={isLocked ? 'Unlock' : 'Lock'}
                      >
                        {isLocked ? (
                          <Unlock className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSection(section);
                        }}
                        className="p-1.5 rounded hover:bg-accent transition-colors"
                        title="Settings"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSection(section.id);
                        }}
                        className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div onClick={() => setSelectedSection(section)} className="cursor-pointer">
                      <SectionRenderer
                        section={section}
                        isEditing={isSelected}
                        onContentChange={(content) => updateSectionContent(section.id, content)}
                      />
                    </div>

                    <div className="px-4 py-2 bg-muted/50 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">{section.type}</Badge>
                      <span>Section {index + 1}</span>
                      {isLocked && <Lock className="h-3 w-3" />}
                      {isHidden && <Eye className="h-3 w-3 opacity-50" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="w-80 border-l border-border overflow-hidden flex flex-col">
          <div className="flex border-b border-border bg-card">
            <button
              onClick={() => setRightPanelTab('content')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                rightPanelTab === 'content'
                  ? 'bg-background border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Content
            </button>
            <button
              onClick={() => setRightPanelTab('style')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                rightPanelTab === 'style'
                  ? 'bg-background border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Style
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {rightPanelTab === 'content' ? (
              <ContentEditorPanel
                section={selectedSection}
                onContentChange={updateSectionContent}
              />
            ) : (
              <StylePanel
                selectedElement={selectedSection}
                onStyleChange={(style) => {
                  if (selectedSection) {
                    updateSectionStyle(selectedSection.id, style);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
