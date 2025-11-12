import type { StepTemplate } from '../types/stepTemplate';

export const stepTemplates: StepTemplate[] = [
  {
    id: 'name-input',
    name: 'Name Input',
    description: 'Collect user full name',
    category: 'basic',
    step_type: 'text_input',
    question_text: 'What is your name?',
    placeholder_text: 'Enter your full name',
    validation_rules: {
      required: true,
      minLength: 2
    },
    field_mapping: 'full_name',
    tags: ['basic', 'personal']
  },
  {
    id: 'email-input',
    name: 'Email Input',
    description: 'Collect user email address',
    category: 'basic',
    step_type: 'email',
    question_text: 'What is your email address?',
    placeholder_text: 'your@email.com',
    validation_rules: {
      required: true,
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    },
    field_mapping: 'email',
    tags: ['basic', 'contact']
  },
  {
    id: 'phone-input',
    name: 'Phone Input',
    description: 'Collect user phone number',
    category: 'basic',
    step_type: 'phone',
    question_text: 'What is your phone number?',
    placeholder_text: '(555) 123-4567',
    validation_rules: {
      required: true,
      pattern: '^[\\d\\s\\(\\)\\-\\+]+$'
    },
    field_mapping: 'phone',
    tags: ['basic', 'contact']
  },
  {
    id: 'yes-no',
    name: 'Yes/No Question',
    description: 'Simple yes or no choice',
    category: 'choice',
    step_type: 'single_choice',
    question_text: 'Your question here?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' }
    ],
    validation_rules: {
      required: true
    },
    tags: ['choice', 'simple']
  }
];

export const STEP_TEMPLATES = stepTemplates;

export const STEP_TEMPLATE_CATEGORIES = [
  { id: 'basic', name: 'Basic', description: 'Essential form fields' },
  { id: 'choice', name: 'Choice', description: 'Selection questions' },
  { id: 'qualification', name: 'Qualification', description: 'Qualifying questions' },
  { id: 'personal', name: 'Personal', description: 'Personal information' }
];

export const STEP_TEMPLATE_VERTICALS = [
  { id: 'general', name: 'General', description: 'General purpose' },
  { id: 'lead_gen', name: 'Lead Generation', description: 'Lead capture' },
  { id: 'qualification', name: 'Qualification', description: 'Lead qualification' }
];

export function getTemplatesByVertical(vertical: string) {
  return stepTemplates;
}

export function getTemplatesByCategory(category: string) {
  return stepTemplates.filter(t => t.category === category);
}

export function searchTemplates(query: string) {
  const lowerQuery = query.toLowerCase();
  return stepTemplates.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery)
  );
}

export function getPopularTemplates() {
  return stepTemplates.slice(0, 4);
}
