import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { OfferTheme } from '../../types/inhouseOffer';

interface ThemeEditorPanelProps {
  themes: OfferTheme[];
  selectedTheme: OfferTheme | null;
  onThemeChange: (theme: OfferTheme) => void;
}

export function ThemeEditorPanel({ themes, selectedTheme, onThemeChange }: ThemeEditorPanelProps) {
  const [showPresets, setShowPresets] = useState(true);
  const [showCustom, setShowCustom] = useState(false);

  if (!selectedTheme) return null;

  function updateTheme(updates: Partial<OfferTheme>) {
    onThemeChange({ ...selectedTheme, ...updates });
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="flex items-center justify-between w-full text-sm font-semibold text-slate-900 dark:text-white mb-3"
        >
          Theme Presets
          <ChevronDown
            size={16}
            className={`transform transition-transform ${showPresets ? 'rotate-180' : ''}`}
          />
        </button>

        {showPresets && (
          <div className="grid grid-cols-2 gap-2">
            {themes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => onThemeChange(theme)}
                className={`p-3 text-left border-2 rounded-lg transition-all ${
                  selectedTheme?.name === theme.name
                    ? 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-600 ring-offset-2'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {theme.name}
                  </span>
                  {selectedTheme?.name === theme.name && (
                    <Check size={14} className="text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="flex gap-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.secondaryColor }}
                  />
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: theme.backgroundColor }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center justify-between w-full text-sm font-semibold text-slate-900 dark:text-white mb-3"
        >
          Customize Theme
          <ChevronDown
            size={16}
            className={`transform transition-transform ${showCustom ? 'rotate-180' : ''}`}
          />
        </button>

        {showCustom && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedTheme.primaryColor}
                  onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                  className="w-12 h-10 rounded border border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={selectedTheme.primaryColor}
                  onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedTheme.secondaryColor}
                  onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                  className="w-12 h-10 rounded border border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={selectedTheme.secondaryColor}
                  onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedTheme.backgroundColor}
                  onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                  className="w-12 h-10 rounded border border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={selectedTheme.backgroundColor}
                  onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Button Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['rounded', 'square', 'pill'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateTheme({ buttonStyle: style })}
                    className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                      selectedTheme.buttonStyle === style
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Button Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateTheme({ buttonSize: size })}
                    className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                      selectedTheme.buttonSize === size
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Font Family
              </label>
              <select
                value={selectedTheme.fontFamily}
                onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Inter, system-ui, sans-serif">Inter (Modern)</option>
                <option value="Georgia, serif">Georgia (Serif)</option>
                <option value="Helvetica, Arial, sans-serif">Helvetica (Classic)</option>
                <option value="Montserrat, sans-serif">Montserrat (Bold)</option>
                <option value="'Segoe UI', Tahoma, sans-serif">Segoe UI (Clean)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Border Radius
              </label>
              <input
                type="range"
                min="0"
                max="24"
                value={parseInt(selectedTheme.borderRadius)}
                onChange={(e) => updateTheme({ borderRadius: `${e.target.value}px` })}
                className="w-full"
              />
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
                {selectedTheme.borderRadius}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                checked={selectedTheme.animations.enabled}
                onChange={(e) =>
                  updateTheme({
                    animations: {
                      ...selectedTheme.animations,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="rounded"
              />
              <label className="text-sm text-slate-700 dark:text-slate-300">
                Enable Animations
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
