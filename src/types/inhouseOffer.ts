export interface InhouseOffer {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  config: OfferConfig;
  everflow_offer_id?: string;
  default_payout: number;
  thumbnail_url?: string;
  compliance_notes?: string;
  timezone?: string;
  locale?: string;
  tracking_pixels?: TrackingPixel[];
  webhooks?: WebhookConfig[];
  ab_testing?: ABTestingConfig;
  is_published: boolean;
  published_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface OfferTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  buttonSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontFamily: string;
  fontSize: {
    base: string;
    heading: string;
  };
  spacing: {
    padding: string;
    margin: string;
  };
  borderRadius: string;
  shadows: {
    card: string;
    button: string;
  };
  animations: {
    enabled: boolean;
    speed: string;
  };
  progressBar: {
    style: 'bar' | 'gradient' | 'steps' | 'percentage' | 'none';
    height: string;
    color: string;
  };
}

export interface OfferConfig {
  theme?: OfferTheme;
  branding?: {
    logo?: string;
    companyName?: string;
    favicon?: string;
  };
  progressBar?: {
    style: 'percentage' | 'steps' | 'bar' | 'gradient' | 'none';
    position: 'top' | 'bottom';
  };
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
    keywords?: string[];
  };
  customCss?: string;
  customJs?: string;
}

export type StepType =
  | 'single_choice'
  | 'multi_choice'
  | 'text_input'
  | 'email'
  | 'phone'
  | 'dropdown'
  | 'date'
  | 'number'
  | 'address'
  | 'zip_code'
  | 'yes_no';

export interface OfferStep {
  id: string;
  offer_id: string;
  step_order: number;
  step_type: StepType;
  question_text: string;
  options: StepOption[];
  validation_rules: ValidationRules;
  conditional_logic: ConditionalLogic;
  placeholder_text?: string;
  help_text?: string;
  field_mapping?: string;
  step_layout?: 'centered' | 'split' | 'sidebar' | 'full-width';
  step_background?: {
    type: 'solid' | 'gradient' | 'image';
    value: string;
  };
  step_image_url?: string;
  step_icon?: string;
  animation_type?: 'fade' | 'slide' | 'bounce' | 'none';
  custom_css?: string;
  created_at: string;
  updated_at: string;
}

export interface StepOption {
  value: string;
  label: string;
  icon?: string;
  nextStep?: number | 'submit' | 'end';
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  customMessage?: string;
}

export interface ConditionalLogic {
  showIf?: ConditionalRule[];
  hideIf?: ConditionalRule[];
  disqualifyIf?: ConditionalRule[];
  disqualifyRedirectUrl?: string;
  operator?: 'AND' | 'OR';
}

export interface ConditionalRule {
  stepId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface OfferSession {
  id: string;
  session_id: string;
  offer_id: string;
  status: 'started' | 'in_progress' | 'completed' | 'abandoned';
  current_step: number;
  ip_address?: string;
  user_agent?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  everflow_click_id?: string;
  referrer?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  geo_data: GeoData;
  started_at: string;
  completed_at?: string;
  last_activity_at: string;
  lead_id?: string;
  created_at: string;
}

export interface GeoData {
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  lat?: number;
  lon?: number;
}

export interface OfferResponse {
  id: string;
  session_id: string;
  step_id: string;
  response_value: any;
  response_text?: string;
  time_spent_seconds: number;
  created_at: string;
}

export interface OfferAnalytics {
  id: string;
  offer_id: string;
  date: string;
  total_views: number;
  sessions_started: number;
  sessions_completed: number;
  leads_generated: number;
  leads_accepted: number;
  leads_rejected: number;
  total_revenue: number;
  conversion_rate: number;
  avg_time_to_complete: number;
  step_drop_offs: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface EmailSubscriber {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  offer_id: string;
  session_id?: string;
  vertical?: string;
  tags: string[];
  subscription_status: 'active' | 'unsubscribed' | 'bounced';
  subscription_date: string;
  last_engagement_date?: string;
  engagement_score: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OfferTemplate {
  id: string;
  name: string;
  vertical: string;
  description: string;
  thumbnail_url?: string;
  steps_template: Omit<OfferStep, 'id' | 'offer_id' | 'created_at' | 'updated_at'>[];
  config: OfferConfig;
  is_featured: boolean;
  usage_count: number;
  avg_conversion_rate: number;
  created_at: string;
  updated_at: string;
}

export interface OfferVersion {
  id: string;
  offer_id: string;
  version_number: number;
  offer_snapshot: InhouseOffer;
  steps_snapshot: OfferStep[];
  published_status: 'draft' | 'preview' | 'scheduled' | 'published' | 'archived';
  published_at?: string;
  published_by?: string;
  scheduled_for?: string;
  publish_url?: string;
  custom_domain?: string;
  seo_config: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  offer_id?: string;
  file_name: string;
  file_url: string;
  file_type: 'image' | 'video' | 'document' | 'icon';
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  tags: string[];
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserOfferTemplate {
  id: string;
  name: string;
  description?: string;
  vertical: string;
  thumbnail_url?: string;
  template_data: Partial<InhouseOffer>;
  steps_template: Partial<OfferStep>[];
  visibility: 'private' | 'team' | 'public';
  created_by: string;
  team_id?: string;
  is_featured: boolean;
  usage_count: number;
  avg_rating: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface BuyerWebhook {
  id: string;
  name: string;
  description?: string;
  webhook_url: string;
  http_method: 'POST' | 'GET' | 'PUT';
  headers: Record<string, string>;
  payload_mapping: Record<string, string>;
  authentication: {
    type?: 'none' | 'basic' | 'bearer' | 'api_key';
    credentials?: Record<string, string>;
  };
  timeout_seconds: number;
  retry_attempts: number;
  active: boolean;
  created_by: string;
  success_count: number;
  failure_count: number;
  last_success_at?: string;
  last_failure_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  session_id?: string;
  lead_id?: string;
  request_payload: any;
  response_status?: number;
  response_body?: string;
  error_message?: string;
  execution_time_ms: number;
  created_at: string;
}

export interface ElementStyles {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  padding?: string;
  margin?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  width?: string;
  height?: string;
}

export interface FunnelVisualization {
  stepName: string;
  stepOrder: number;
  views: number;
  completions: number;
  dropOffs: number;
  dropOffRate: number;
  avgTimeSpent: number;
}

export interface TrackingPixel {
  id: string;
  name: string;
  platform: 'facebook' | 'google' | 'tiktok' | 'snapchat' | 'linkedin' | 'twitter' | 'pinterest' | 'custom';
  pixelId: string;
  eventName?: string;
  triggerOn: 'page_load' | 'form_start' | 'form_complete' | 'step_complete';
  enabled: boolean;
  customCode?: string;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  method: 'POST' | 'GET' | 'PUT';
  headers?: Record<string, string>;
  triggerOn: 'form_start' | 'form_complete' | 'lead_created' | 'lead_accepted' | 'lead_rejected';
  enabled: boolean;
  retryOnFailure: boolean;
  maxRetries?: number;
}

export interface ABTestingConfig {
  enabled: boolean;
  variants: ABVariant[];
  trafficSplitMethod: 'even' | 'weighted' | 'manual';
  winnerMetric: 'conversion_rate' | 'revenue' | 'completion_rate' | 'time_to_complete';
}

export interface ABVariant {
  id: string;
  name: string;
  description?: string;
  trafficPercentage: number;
  isControl: boolean;
  themeOverride?: Partial<OfferTheme>;
  stepsOverride?: Record<string, Partial<OfferStep>>;
  configOverride?: Partial<OfferConfig>;
}

