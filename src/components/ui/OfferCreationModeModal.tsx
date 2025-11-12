import { Sparkles, Wrench, X } from 'lucide-react';

interface OfferCreationModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWizard: () => void;
  onSelectBuilder: () => void;
}

export function OfferCreationModeModal({
  isOpen,
  onClose,
  onSelectWizard,
  onSelectBuilder,
}: OfferCreationModeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Create New Offer
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Choose how you'd like to create your offer
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={onSelectWizard}
              className="group p-8 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all text-left"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 group-hover:scale-110 transition-transform">
                  <Sparkles size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Guided Wizard
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Perfect for quick setup with proven templates
                  </p>
                  <ul className="text-xs text-slate-500 dark:text-slate-500 space-y-2 text-left">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>Step-by-step guidance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>Industry-specific templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>AI-powered suggestions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>Faster creation time</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold group-hover:bg-blue-700 transition-colors">
                    Start with Wizard
                  </span>
                </div>
              </div>
            </button>

            <button
              onClick={onSelectBuilder}
              className="group p-8 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:scale-110 transition-transform">
                  <Wrench size={32} className="text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Advanced Builder
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    For experienced users who want full control
                  </p>
                  <ul className="text-xs text-slate-500 dark:text-slate-500 space-y-2 text-left">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>Complete customization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>Visual step designer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>Advanced conditional logic</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>Fine-grained control</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 dark:bg-slate-700 text-white rounded-lg font-semibold group-hover:bg-slate-700 dark:group-hover:bg-slate-600 transition-colors">
                    Start from Scratch
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="px-6 pb-6">
          <p className="text-xs text-slate-500 dark:text-slate-500 text-center">
            Don't worry - you can switch to the advanced builder after using the wizard to fine-tune your offer
          </p>
        </div>
      </div>
    </div>
  );
}
