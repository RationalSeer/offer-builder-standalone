import { OfferTheme } from '../../types/inhouseOffer';
import { Type, Palette, Layout as LayoutIcon } from 'lucide-react';

interface DesignSettingsPanelProps {
  theme: OfferTheme;
  onThemeChange: (theme: OfferTheme) => void;
}

const FONT_OPTIONS = [
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'Poppins', sans-serif", label: 'Poppins' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'Lato', sans-serif", label: 'Lato' },
  { value: "'Raleway', sans-serif", label: 'Raleway' },
  { value: "'Nunito', sans-serif", label: 'Nunito' },
];

const BUTTON_STYLES = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'square', label: 'Square' },
  { value: 'pill', label: 'Pill' },
];

const BUTTON_SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'xlarge', label: 'X-Large' },
];

export function DesignSettingsPanel({ theme, onThemeChange }: DesignSettingsPanelProps) {
  function updateTheme(updates: Partial<OfferTheme>) {
    onThemeChange({ ...theme, ...updates });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Palette size={16} />
          Color Palette
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="w-12 h-10 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={theme.primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Secondary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.secondaryColor}
                onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                className="w-12 h-10 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={theme.secondaryColor}
                onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.backgroundColor}
                onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                className="w-12 h-10 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={theme.backgroundColor}
                onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Text Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.textColor}
                onChange={(e) => updateTheme({ textColor: e.target.value })}
                className="w-12 h-10 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={theme.textColor}
                onChange={(e) => updateTheme({ textColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Heading Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.headingColor}
                onChange={(e) => updateTheme({ headingColor: e.target.value })}
                className="w-12 h-10 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={theme.headingColor}
                onChange={(e) => updateTheme({ headingColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Type size={16} />
          Typography
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Font Family
            </label>
            <select
              value={theme.fontFamily}
              onChange={(e) => updateTheme({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Base Font Size
            </label>
            <input
              type="text"
              value={theme.fontSize.base}
              onChange={(e) => updateTheme({ fontSize: { ...theme.fontSize, base: e.target.value } })}
              placeholder="16px"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Heading Font Size
            </label>
            <input
              type="text"
              value={theme.fontSize.heading}
              onChange={(e) => updateTheme({ fontSize: { ...theme.fontSize, heading: e.target.value } })}
              placeholder="28px"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <LayoutIcon size={16} />
          Button Styling
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Button Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BUTTON_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => updateTheme({ buttonStyle: style.value as any })}
                  className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                    theme.buttonStyle === style.value
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Button Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BUTTON_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => updateTheme({ buttonSize: size.value as any })}
                  className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                    theme.buttonSize === size.value
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Border Radius
            </label>
            <input
              type="text"
              value={theme.borderRadius}
              onChange={(e) => updateTheme({ borderRadius: e.target.value })}
              placeholder="12px"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          Spacing
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Padding
            </label>
            <input
              type="text"
              value={theme.spacing.padding}
              onChange={(e) => updateTheme({ spacing: { ...theme.spacing, padding: e.target.value } })}
              placeholder="24px"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Margin
            </label>
            <input
              type="text"
              value={theme.spacing.margin}
              onChange={(e) => updateTheme({ spacing: { ...theme.spacing, margin: e.target.value } })}
              placeholder="16px"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
