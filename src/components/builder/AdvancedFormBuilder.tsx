import { useState } from 'react';
import { Plus, Trash2, GripVertical, Settings, Save } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FormFieldConfig, MultiStepFormConfig } from '../../types/pageBuilder';
import { cn } from '../../lib/utils';

interface AdvancedFormBuilderProps {
  onSave?: (fields: FormFieldConfig[], multiStep?: MultiStepFormConfig) => void;
}

const fieldTypes = [
  { value: 'text', label: 'Text Input', icon: '📝' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'phone', label: 'Phone', icon: '📞' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'textarea', label: 'Text Area', icon: '📄' },
  { value: 'select', label: 'Dropdown', icon: '▼' },
  { value: 'multiselect', label: 'Multi-Select', icon: '☑️' },
  { value: 'radio', label: 'Radio Buttons', icon: '◉' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑' },
  { value: 'date', label: 'Date Picker', icon: '📅' },
  { value: 'time', label: 'Time Picker', icon: '🕐' },
  { value: 'file', label: 'File Upload', icon: '📎' },
  { value: 'range', label: 'Range Slider', icon: '🎚️' },
  { value: 'rating', label: 'Star Rating', icon: '⭐' },
  { value: 'address', label: 'Address', icon: '🏠' },
  { value: 'hidden', label: 'Hidden Field', icon: '👁️' },
];

export function AdvancedFormBuilder({ onSave }: AdvancedFormBuilderProps) {
  const [fields, setFields] = useState<FormFieldConfig[]>([
    {
      id: '1',
      name: 'first_name',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'John',
    },
    {
      id: '2',
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'john@example.com',
    },
  ]);
  const [selectedField, setSelectedField] = useState<FormFieldConfig | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [multiStepEnabled, setMultiStepEnabled] = useState(false);

  const addField = (type: FormFieldConfig['type']) => {
    const newField: FormFieldConfig = {
      id: `field_${Date.now()}`,
      name: `field_${Date.now()}`,
      label: `New ${type} Field`,
      type,
      required: false,
      placeholder: '',
    };
    setFields([...fields, newField]);
    setSelectedField(newField);
  };

  const updateField = (id: string, updates: Partial<FormFieldConfig>) => {
    const newFields = fields.map((field) =>
      field.id === id ? { ...field, ...updates } : field
    );
    setFields(newFields);
    if (selectedField?.id === id) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (selectedField?.id === id) {
      setSelectedField(null);
    }
  };

  const duplicateField = (field: FormFieldConfig) => {
    const newField: FormFieldConfig = {
      ...field,
      id: `field_${Date.now()}`,
      name: `${field.name}_copy`,
    };
    const index = fields.findIndex((f) => f.id === field.id);
    const newFields = [...fields];
    newFields.splice(index + 1, 0, newField);
    setFields(newFields);
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = [...fields];
    const [removed] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, removed);
    setFields(newFields);
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== index) {
      moveField(draggedItem, index);
      setDraggedItem(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="h-full flex">
      <div className="w-64 border-r border-border p-4 overflow-y-auto">
        <h3 className="font-semibold mb-3 text-sm">Field Types</h3>
        <div className="space-y-1">
          {fieldTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => addField(type.value as FormFieldConfig['type'])}
              className="w-full p-2 rounded border border-border hover:border-primary hover:bg-accent transition-all text-left text-sm flex items-center gap-2"
            >
              <span className="text-base">{type.icon}</span>
              <span className="flex-1">{type.label}</span>
              <Plus className="h-3 w-3 text-muted-foreground" />
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={multiStepEnabled}
              onChange={(e) => setMultiStepEnabled(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium">Multi-Step Form</span>
          </label>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Form Fields</h2>
              <p className="text-sm text-muted-foreground">
                {fields.length} field{fields.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button onClick={() => onSave && onSave(fields)}>
              <Save className="h-4 w-4 mr-2" />
              Save Form
            </Button>
          </div>

          {fields.length === 0 ? (
            <Card className="text-center p-12">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-muted-foreground">
                Add fields from the left sidebar to build your form
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => {
                const isSelected = selectedField?.id === field.id;
                const fieldType = fieldTypes.find((t) => t.value === field.type);

                return (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedField(field)}
                    className={cn(
                      'group p-4 rounded-lg border-2 bg-card transition-all cursor-pointer',
                      isSelected ? 'border-primary shadow-md' : 'border-border hover:border-primary/50',
                      draggedItem === index && 'opacity-50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button className="mt-1 cursor-move text-muted-foreground hover:text-foreground">
                        <GripVertical className="h-5 w-5" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">{fieldType?.icon}</span>
                          <Badge variant="secondary">{fieldType?.label}</Badge>
                          {field.required && (
                            <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm font-medium">{field.label}</div>
                        <div className="text-xs text-muted-foreground">
                          Name: {field.name}
                        </div>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedField(field);
                          }}
                          className="p-1.5 rounded hover:bg-accent"
                          title="Edit"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeField(field.id);
                          }}
                          className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-80 border-l border-border p-4 overflow-y-auto">
        {selectedField ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Field Properties</h3>

            <div>
              <label className="text-xs font-medium mb-1 block">Field Label</label>
              <input
                type="text"
                value={selectedField.label}
                onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Field Name</label>
              <input
                type="text"
                value={selectedField.name}
                onChange={(e) => updateField(selectedField.id, { name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Placeholder</label>
              <input
                type="text"
                value={selectedField.placeholder || ''}
                onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                checked={selectedField.required}
                onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="required" className="text-sm font-medium">
                Required Field
              </label>
            </div>

            {(selectedField.type === 'select' ||
              selectedField.type === 'multiselect' ||
              selectedField.type === 'radio') && (
              <div>
                <label className="text-xs font-medium mb-1 block">Options (one per line)</label>
                <textarea
                  value={selectedField.options?.join('\n') || ''}
                  onChange={(e) =>
                    updateField(selectedField.id, {
                      options: e.target.value.split('\n').filter((o) => o.trim()),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-border rounded bg-background font-mono"
                  rows={5}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <h4 className="text-xs font-medium mb-2">Validation</h4>

              {selectedField.type === 'text' && (
                <>
                  <div className="mb-2">
                    <label className="text-xs text-muted-foreground block mb-1">
                      Min Length
                    </label>
                    <input
                      type="number"
                      value={selectedField.validation?.minLength || ''}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          validation: {
                            ...selectedField.validation,
                            minLength: parseInt(e.target.value) || undefined,
                          },
                        })
                      }
                      className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Max Length
                    </label>
                    <input
                      type="number"
                      value={selectedField.validation?.maxLength || ''}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          validation: {
                            ...selectedField.validation,
                            maxLength: parseInt(e.target.value) || undefined,
                          },
                        })
                      }
                      className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={() => duplicateField(selectedField)}
              >
                Duplicate Field
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Select a field to edit its properties
          </div>
        )}
      </div>
    </div>
  );
}
