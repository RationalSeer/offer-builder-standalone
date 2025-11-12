export interface DynamicVariable {
  key: string;
  label: string;
  description: string;
  category: 'user' | 'session' | 'geo' | 'time' | 'answer' | 'utm';
  example: string;
}

export interface SessionData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  ip_address?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  user_agent?: string;
  device_type?: 'desktop' | 'tablet' | 'mobile';
  browser?: string;
  answers?: Record<string, any>;
  [key: string]: any;
}

export interface GeoData {
  city?: string;
  state?: string;
  state_code?: string;
  country?: string;
  country_code?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface DynamicContentContext {
  sessionData: SessionData;
  geoData?: GeoData;
  currentTime: Date;
  answers: Record<string, any>;
}

export const BUILT_IN_VARIABLES: DynamicVariable[] = [
  {
    key: 'first_name',
    label: 'First Name',
    description: 'User\'s first name',
    category: 'user',
    example: 'John',
  },
  {
    key: 'last_name',
    label: 'Last Name',
    description: 'User\'s last name',
    category: 'user',
    example: 'Doe',
  },
  {
    key: 'email',
    label: 'Email',
    description: 'User\'s email address',
    category: 'user',
    example: 'john@example.com',
  },
  {
    key: 'phone',
    label: 'Phone',
    description: 'User\'s phone number',
    category: 'user',
    example: '(555) 123-4567',
  },
  {
    key: 'city',
    label: 'City',
    description: 'User\'s city from GEO data',
    category: 'geo',
    example: 'San Francisco',
  },
  {
    key: 'state',
    label: 'State',
    description: 'User\'s state from GEO data',
    category: 'geo',
    example: 'California',
  },
  {
    key: 'state_code',
    label: 'State Code',
    description: 'User\'s state code (e.g., CA)',
    category: 'geo',
    example: 'CA',
  },
  {
    key: 'country',
    label: 'Country',
    description: 'User\'s country',
    category: 'geo',
    example: 'United States',
  },
  {
    key: 'zip_code',
    label: 'ZIP Code',
    description: 'User\'s ZIP/postal code',
    category: 'geo',
    example: '94102',
  },
  {
    key: 'time_of_day',
    label: 'Time of Day',
    description: 'Current time of day (morning, afternoon, evening)',
    category: 'time',
    example: 'morning',
  },
  {
    key: 'day_of_week',
    label: 'Day of Week',
    description: 'Current day of the week',
    category: 'time',
    example: 'Monday',
  },
  {
    key: 'referrer',
    label: 'Referrer',
    description: 'Website referrer URL',
    category: 'session',
    example: 'google.com',
  },
  {
    key: 'utm_source',
    label: 'UTM Source',
    description: 'UTM source parameter',
    category: 'utm',
    example: 'facebook',
  },
  {
    key: 'utm_medium',
    label: 'UTM Medium',
    description: 'UTM medium parameter',
    category: 'utm',
    example: 'cpc',
  },
  {
    key: 'utm_campaign',
    label: 'UTM Campaign',
    description: 'UTM campaign parameter',
    category: 'utm',
    example: 'summer_sale',
  },
  {
    key: 'device_type',
    label: 'Device Type',
    description: 'User\'s device type',
    category: 'session',
    example: 'mobile',
  },
];

export interface WizardTemplate {
  id: string;
  vertical: string;
  goal: 'lead_gen' | 'qualification' | 'survey' | 'quiz';
  name: string;
  description?: string;
  suggested_steps: any[];
  popularity_score: number;
  created_at: string;
  updated_at?: string;
}

export interface WizardState {
  step: number;
  vertical?: string;
  goal?: 'lead_gen' | 'qualification' | 'survey' | 'quiz';
  template?: WizardTemplate;
  useAI: boolean;
  design?: {
    primaryColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
  };
  routing?: {
    webhook_url?: string;
    email_notifications?: string[];
  };
}

