import { useState } from 'react';
import { Code, Search, Info } from 'lucide-react';
import type { DynamicVariable } from '../../types/dynamicContent';
import { BUILT_IN_VARIABLES } from '../../types/dynamicContent';

interface DynamicVariableInserterProps {
  onInsert: (variable: string) => void;
}

export function DynamicVariableInserter({ onInsert }: DynamicVariableInserterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Variables' },
    { value: 'user', label: 'User Info' },
    { value: 'geo', label: 'Location' },
    { value: 'time', label: 'Time' },
    { value: 'session', label: 'Session' },
    { value: 'utm', label: 'UTM' },
    { value: 'answer', label: 'Answers' },
  ];

  const filteredVariables = BUILT_IN_VARIABLES.filter((v) => {
    const matchesSearch =
      search === '' ||
      v.label.toLowerCase().includes(search.toLowerCase()) ||
      v.key.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const answerVariables: DynamicVariable[] = [
    {
      key: 'answer_1',
      label: 'Answer from Step 1',
      description: 'Reference the answer from step 1',
      category: 'answer',
      example: 'Bachelor\'s Degree',
    },
    {
      key: 'answer_2',
      label: 'Answer from Step 2',
      description: 'Reference the answer from step 2',
      category: 'answer',
      example: 'Business',
    },
  ];

  function handleInsert(variable: DynamicVariable, withFallback: boolean = false) {
    const variableText = withFallback
      ? `{{${variable.key}|${variable.example}}}`
      : `{{${variable.key}}}`;

    onInsert(variableText);
    setIsOpen(false);
    setSearch('');
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors flex items-center gap-2 text-sm font-medium"
      >
        <Code size={16} />
        Insert Variable
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Insert Dynamic Variable
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ×
            </button>
          </div>

          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search variables..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                  ${
                    selectedCategory === cat.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {(selectedCategory === 'all' || selectedCategory === 'answer') && (
              <>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Answer References
                </h4>
                {answerVariables.map((variable) => (
                  <div
                    key={variable.key}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 rounded text-sm font-mono">
                            {`{{${variable.key}}}`}
                          </code>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {variable.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {variable.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Info size={12} />
                          Example: {variable.example}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleInsert(variable, false)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          Insert
                        </button>
                        <button
                          onClick={() => handleInsert(variable, true)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                        >
                          + Fallback
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredVariables.length > 0 && (
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-6 mb-2">
                    Built-in Variables
                  </h4>
                )}
              </>
            )}

            {filteredVariables.map((variable) => (
              <div
                key={variable.key}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 rounded text-sm font-mono">
                        {`{{${variable.key}}}`}
                      </code>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {variable.label}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">
                        {variable.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {variable.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Info size={12} />
                      Example: {variable.example}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleInsert(variable, false)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Insert
                    </button>
                    <button
                      onClick={() => handleInsert(variable, true)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                    >
                      + Fallback
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVariables.length === 0 && selectedCategory !== 'answer' && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No variables found matching "{search}"
            </div>
          )}
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Syntax:</strong> Use <code className="px-1 bg-blue-100 dark:bg-blue-900 rounded">{`{{variable}}`}</code> or{' '}
              <code className="px-1 bg-blue-100 dark:bg-blue-900 rounded">{`{{variable|fallback}}`}</code> for default values
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
