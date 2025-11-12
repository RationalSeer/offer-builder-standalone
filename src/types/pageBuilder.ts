export type SectionCategory =
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'cta'
  | 'form'
  | 'faq'
  | 'pricing'
  | 'video'
  | 'gallery'
  | 'stats'
  | 'team'
  | 'blog'
  | 'footer'
  | 'navigation'
  | 'countdown'
  | 'social-proof';

export interface Typography {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export interface Spacing {
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
}

export interface Background {
  type: 'solid' | 'gradient' | 'image' | 'video';
  value: string;
  overlay?: {
    color: string;
    opacity: number;
  };
  position?: string;
  size?: string;
  repeat?: string;
}

export interface Border {
  width?: string;
  style?: 'solid' | 'dashed' | 'dotted' | 'none';
  color?: string;
  radius?: string;
}

export interface Shadow {
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  color: string;
  inset?: boolean;
}

export interface Animation {
  type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'none';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: string;
  delay?: string;
  trigger?: 'load' | 'scroll' | 'hover' | 'click';
}

export interface ElementStyle {
  typography?: Typography;
  spacing?: Spacing;
  background?: Background;
  border?: Border;
  shadows?: Shadow[];
  animation?: Animation;
  customCSS?: string;
}

export interface ResponsiveOverrides {
  mobile?: {
    hidden?: boolean;
    typography?: Partial<Typography>;
    spacing?: Partial<Spacing>;
    order?: number;
  };
  tablet?: {
    hidden?: boolean;
    typography?: Partial<Typography>;
    spacing?: Partial<Spacing>;
    order?: number;
  };
}

export interface FormFieldConfig {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'multiselect'
    | 'radio' | 'checkbox' | 'date' | 'time' | 'file' | 'range' | 'rating' | 'address' | 'hidden';
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    customMessage?: string;
  };
  conditionalLogic?: {
    showIf: {
      field: string;
      operator: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than';
      value: any;
    };
  };
  style?: ElementStyle;
}

export interface MultiStepFormConfig {
  enabled: boolean;
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    fields: string[];
  }>;
  showProgress: boolean;
  progressStyle: 'bar' | 'steps' | 'percentage';
}

export interface SectionContent {
  [key: string]: any;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
  videoUrl?: string;
  items?: Array<{
    id: string;
    [key: string]: any;
  }>;
}

export interface PageSection {
  id: string;
  type: string;
  content: SectionContent;
  style?: ElementStyle;
  responsive?: ResponsiveOverrides;
  locked?: boolean;
  visible?: boolean;
}

export interface CountdownConfig {
  endDate?: string;
  evergreen?: {
    enabled: boolean;
    duration: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  labels: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  style: ElementStyle;
}

export interface ExitIntentConfig {
  enabled: boolean;
  delay: number;
  showOnce: boolean;
  title: string;
  message: string;
  buttonText: string;
  buttonLink?: string;
  formFields?: FormFieldConfig[];
  style: ElementStyle;
}

export interface SocialProofConfig {
  type: 'live-counter' | 'recent-conversions' | 'testimonial-rotator';
  enabled: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  notifications?: Array<{
    name: string;
    action: string;
    timestamp: string;
  }>;
  style: ElementStyle;
}

export interface StickyElementConfig {
  type: 'header' | 'footer' | 'cta-button' | 'side-tab';
  enabled: boolean;
  content: SectionContent;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showAfterScroll?: number;
  style: ElementStyle;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: Record<string, any>;
}

export interface CustomCodeInjection {
  headScripts?: string;
  bodyScripts?: string;
  footerScripts?: string;
  customCSS?: string;
}

export interface EnhancedPageConfig {
  sections: PageSection[];
  globalStyles?: {
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
    spacing?: Record<string, string>;
  };
  formConfig?: {
    fields: FormFieldConfig[];
    multiStep?: MultiStepFormConfig;
    submitText: string;
    successMessage?: string;
    redirectUrl?: string;
    style: ElementStyle;
  };
  conversionTools?: {
    countdown?: CountdownConfig;
    exitIntent?: ExitIntentConfig;
    socialProof?: SocialProofConfig;
    stickyElements?: StickyElementConfig[];
  };
  seo?: SEOMetadata;
  customCode?: CustomCodeInjection;
  mobileOptimized: boolean;
}

export interface SectionLibraryItem {
  id: string;
  section_type: string;
  name: string;
  description: string;
  category: SectionCategory;
  icon: string;
  default_config: PageSection;
  preview_data: SectionContent;
  is_premium: boolean;
  sort_order: number;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview_image_url?: string;
  config: EnhancedPageConfig;
  is_system: boolean;
  popularity_score: number;
  created_at: string;
}

export interface MediaLibraryItem {
  id: string;
  user_id: string;
  file_type: 'image' | 'video' | 'document' | 'icon';
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type?: string;
  width?: number;
  height?: number;
  tags: string[];
  folder: string;
  is_stock: boolean;
  stock_source?: string;
  created_at: string;
}

export interface PageVersion {
  id: string;
  landing_page_id: string;
  version_number: number;
  config_snapshot: EnhancedPageConfig;
  change_summary?: string;
  created_by?: string;
  created_at: string;
}

export interface SavedStyle {
  id: string;
  user_id: string;
  style_type: 'color_palette' | 'font_combo' | 'css_snippet';
  name: string;
  config: Record<string, any>;
  is_favorite: boolean;
  created_at: string;
}

