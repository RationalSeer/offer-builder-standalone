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
      format: 'email'
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
      format: 'phone'
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
      { id: 'yes', label: 'Yes', value: 'yes' },
      { id: 'no', label: 'No', value: 'no' }
    ],
    validation_rules: {
      required: true
    },
    tags: ['choice', 'simple']
  }
];
