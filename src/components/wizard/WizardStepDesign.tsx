import { useState } from 'react';
import { Palette, Type } from 'lucide-react';

interface WizardStepDesignProps {
  design: {
    primaryColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
  };
  onDesignChange: (design: any) => void;
}

const PRESET_COLORS = [
  { name: 'Blue', primary: '#3b82f6', bg: '#ffffff' },
  { name: 'Green', primary: '#10b981', bg: '#ffffff' },
  { name: 'Purple', primary: '#8b5cf6', bg: '#ffffff' },
  { name: 'Red', primary: '#ef4444', bg: '#ffffff' },
  { name: 'Orange', primary: '#f97316', bg: '#ffffff' },
  { name: 'Teal', primary: '#14b8a6', bg: '#ffffff' },
  { name: 'Dark', primary: '#3b82f6', bg: '#0f172a' },
  { name: 'Slate', primary: '#64748b', bg: '#f8fafc' },
];

const FONTS = [
  { value: 'Inter, sans-serif', label: 'Inter (Modern)' },
  { value: 'Georgia, serif', label: 'Georgia (Classic)' },
  { value: 'Roboto, sans-serif', label: 'Roboto (Clean)' },
  { value: 'Playfair Display, serif', label: 'Playfair (Elegant)' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat (Bold)' },
];

export function WizardStepDesign({ design, onDesignChange }: WizardStepDesignProps) {
  const [customColors, setCustomColors] = useState(false);

  function handlePresetSelect(preset: typeof PRESET_COLORS[0]) {
    onDesignChange({
      ...design,
      primaryColor: preset.primary,
      backgroundColor: preset.bg,
    });
    setCustomColors(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Design & Branding
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Customize colors and typography to match your brand
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Color Scheme
        </label>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {PRESET_COLORS.map((preset) => {
            const isSelected =
              design.primaryColor === preset.primary && design.backgroundColor === preset.bg;

            return (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    isSelected
                      ? 'border-blue-500 shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700"
                    style={{ backgroundColor: preset.bg }}
                  />
                </div>
                <p className="text-xs font-medium text-slate-900 dark:text-white">{preset.name}</p>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setCustomColors(!customColors)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {customColors ? 'Hide' : 'Show'} custom colors
        </button>

        {customColors && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={design.primaryColor || '#3b82f6'}
                  onChange={(e) =>
                    onDesignChange({ ...design, primaryColor: e.target.value })
                  }
                  className="w-16 h-10 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={design.primaryColor || '#3b82f6'}
                  onChange={(e) =>
                    onDesignChange({ ...design, primaryColor: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="#3b82f6"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={design.backgroundColor || '#ffffff'}
                  onChange={(e) =>
                    onDesignChange({ ...design, backgroundColor: e.target.value })
                  }
                  className="w-16 h-10 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={design.backgroundColor || '#ffffff'}
                  onChange={(e) =>
                    onDesignChange({ ...design, backgroundColor: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Font Family
        </label>
        <div className="grid grid-cols-1 gap-2">
          {FONTS.map((font) => {
            const isSelected = design.fontFamily === font.value;

            return (
              <button
                key={font.value}
                onClick={() => onDesignChange({ ...design, fontFamily: font.value })}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }
                `}
              >
                <Type
                  size={20}
                  className={
                    isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                  }
                />
                <span
                  className="flex-1 text-lg text-slate-900 dark:text-white"
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <Palette size={24} className="text-slate-400 dark:text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Preview</h3>
        </div>
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: design.backgroundColor || '#ffffff',
            fontFamily: design.fontFamily || 'Inter, sans-serif',
          }}
        >
          <h4
            className="text-2xl font-bold mb-2"
            style={{ color: design.primaryColor || '#3b82f6' }}
          >
            Sample Heading
          </h4>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            This is how your offer will look with the selected design settings.
          </p>
          <button
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: design.primaryColor || '#3b82f6' }}
          >
            Sample Button
          </button>
        </div>
      </div>
    </div>
  );
}
