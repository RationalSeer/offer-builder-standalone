import { useState } from 'react';
import { Type, Palette, Box, Image, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { ElementStyle } from '../../types/pageBuilder';

interface StylePanelProps {
  selectedElement: any;
  onStyleChange: (style: ElementStyle) => void;
}

export function StylePanel({ selectedElement, onStyleChange }: StylePanelProps) {
  const [activeTab, setActiveTab] = useState<'typography' | 'colors' | 'spacing' | 'background' | 'effects'>('typography');
  const [style, setStyle] = useState<ElementStyle>(selectedElement?.style || {});

  const updateStyle = (updates: Partial<ElementStyle>) => {
    const newStyle = { ...style, ...updates };
    setStyle(newStyle);
    onStyleChange(newStyle);
  };

  const tabs = [
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'spacing', label: 'Spacing', icon: Box },
    { id: 'background', label: 'Background', icon: Image },
    { id: 'effects', label: 'Effects', icon: Sparkles },
  ];

  if (!selectedElement) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Select an element to edit its style</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Style Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1 border-b border-border pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                <Icon className="h-3 w-3 inline mr-1" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'typography' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Font Family</label>
              <select
                value={style.typography?.fontFamily || 'inherit'}
                onChange={(e) => updateStyle({
                  typography: { ...style.typography, fontFamily: e.target.value }
                })}
                className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background"
              >
                <option value="inherit">Inherit</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Verdana, sans-serif">Verdana</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Font Size</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={parseInt(style.typography?.fontSize || '16')}
                  onChange={(e) => updateStyle({
                    typography: { ...style.typography, fontSize: `${e.target.value}px` }
                  })}
                  className="flex-1 px-2 py-1.5 text-sm border border-border rounded bg-background"
                  min="8"
                  max="120"
                />
                <select
                  className="px-2 py-1.5 text-sm border border-border rounded bg-background"
                  defaultValue="px"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                  <option value="em">em</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Font Weight</label>
              <select
                value={style.typography?.fontWeight || '400'}
                onChange={(e) => updateStyle({
                  typography: { ...style.typography, fontWeight: e.target.value }
                })}
                className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background"
              >
                <option value="300">Light (300)</option>
                <option value="400">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semi-Bold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extra-Bold (800)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Line Height</label>
              <input
                type="number"
                step="0.1"
                value={parseFloat(style.typography?.lineHeight || '1.5')}
                onChange={(e) => updateStyle({
                  typography: { ...style.typography, lineHeight: e.target.value }
                })}
                className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background"
                min="1"
                max="3"
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Text Align</label>
              <div className="grid grid-cols-4 gap-1">
                {['left', 'center', 'right', 'justify'].map((align) => (
                  <button
                    key={align}
                    onClick={() => updateStyle({
                      typography: { ...style.typography, textAlign: align as any }
                    })}
                    className={`px-2 py-1.5 text-xs border rounded capitalize ${
                      style.typography?.textAlign === align
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Text Transform</label>
              <select
                value={style.typography?.textTransform || 'none'}
                onChange={(e) => updateStyle({
                  typography: { ...style.typography, textTransform: e.target.value as any }
                })}
                className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background"
              >
                <option value="none">None</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Color controls coming soon</p>
          </div>
        )}

        {activeTab === 'spacing' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-2 block">Padding</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Top</label>
                  <input
                    type="text"
                    placeholder="0px"
                    value={style.spacing?.paddingTop || ''}
                    onChange={(e) => updateStyle({
                      spacing: { ...style.spacing, paddingTop: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Bottom</label>
                  <input
                    type="text"
                    placeholder="0px"
                    value={style.spacing?.paddingBottom || ''}
                    onChange={(e) => updateStyle({
                      spacing: { ...style.spacing, paddingBottom: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Left</label>
                  <input
                    type="text"
                    placeholder="0px"
                    value={style.spacing?.paddingLeft || ''}
                    onChange={(e) => updateStyle({
                      spacing: { ...style.spacing, paddingLeft: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Right</label>
                  <input
                    type="text"
                    placeholder="0px"
                    value={style.spacing?.paddingRight || ''}
                    onChange={(e) => updateStyle({
                      spacing: { ...style.spacing, paddingRight: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-2 block">Margin</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Top</label>
                  <input
                    type="text"
                    placeholder="0px"
                    value={style.spacing?.marginTop || ''}
                    onChange={(e) => updateStyle({
                      spacing: { ...style.spacing, marginTop: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Bottom</label>
                  <input
                    type="text"
                    placeholder="0px"
                    value={style.spacing?.marginBottom || ''}
                    onChange={(e) => updateStyle({
                      spacing: { ...style.spacing, marginBottom: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'background' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-2 block">Background Type</label>
              <select
                value={style.background?.type || 'solid'}
                onChange={(e) => updateStyle({
                  background: { ...style.background, type: e.target.value as any }
                })}
                className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background"
              >
                <option value="solid">Solid Color</option>
                <option value="gradient">Gradient</option>
                <option value="image">Image</option>
              </select>
            </div>

            {style.background?.type === 'solid' && (
              <div>
                <label className="text-xs font-medium mb-2 block">Color</label>
                <input
                  type="color"
                  value={style.background?.value || '#ffffff'}
                  onChange={(e) => updateStyle({
                    background: { ...style.background, value: e.target.value, type: 'solid' }
                  })}
                  className="w-full h-10 border border-border rounded cursor-pointer"
                />
              </div>
            )}

            {style.background?.type === 'gradient' && (
              <div>
                <label className="text-xs font-medium mb-2 block">Gradient CSS</label>
                <textarea
                  value={style.background?.value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}
                  onChange={(e) => updateStyle({
                    background: { ...style.background, value: e.target.value, type: 'gradient' }
                  })}
                  className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background font-mono"
                  rows={3}
                  placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
              </div>
            )}

            {style.background?.type === 'image' && (
              <div>
                <label className="text-xs font-medium mb-2 block">Image URL</label>
                <input
                  type="text"
                  value={style.background?.value || ''}
                  onChange={(e) => updateStyle({
                    background: { ...style.background, value: e.target.value, type: 'image' }
                  })}
                  className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-2 block">Border Radius</label>
              <input
                type="text"
                value={style.border?.radius || ''}
                onChange={(e) => updateStyle({
                  border: { ...style.border, radius: e.target.value }
                })}
                className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background"
                placeholder="8px"
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-2 block">Animation</label>
              <select
                value={style.animation?.type || 'none'}
                onChange={(e) => updateStyle({
                  animation: { ...style.animation, type: e.target.value as any }
                })}
                className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background"
              >
                <option value="none">None</option>
                <option value="fade">Fade In</option>
                <option value="slide">Slide In</option>
                <option value="zoom">Zoom In</option>
                <option value="bounce">Bounce</option>
              </select>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <Button size="sm" className="w-full" variant="secondary">
            Reset Styles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
