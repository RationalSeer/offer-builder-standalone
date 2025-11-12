import type { OfferStep } from './inhouseOffer';

export interface StepTemplate extends Partial<OfferStep> {
  id: string;
  name: string;
  description: string;
  category: string;
  vertical?: string;
  tags?: string[];
  usageCount?: number;
  rating?: number;
  previewImage?: string;
}

export interface StepTemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}
