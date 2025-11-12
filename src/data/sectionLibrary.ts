import type { PageSection } from '../types/pageBuilder';

export interface SectionCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const sectionCategories: SectionCategory[] = [
  {
    id: 'hero',
    name: 'Hero Sections',
    description: 'Eye-catching headers and hero sections',
    icon: 'Layout'
  },
  {
    id: 'content',
    name: 'Content Sections',
    description: 'Text, images, and media content blocks',
    icon: 'FileText'
  },
  {
    id: 'cta',
    name: 'Call-to-Action',
    description: 'Conversion-focused sections',
    icon: 'MousePointer'
  },
  {
    id: 'testimonial',
    name: 'Testimonials',
    description: 'Social proof and reviews',
    icon: 'Quote'
  },
  {
    id: 'form',
    name: 'Forms',
    description: 'Lead capture and contact forms',
    icon: 'FormInput'
  },
  {
    id: 'footer',
    name: 'Footers',
    description: 'Page footers with links and info',
    icon: 'Layout'
  }
];

export const sectionLibrary: Record<string, PageSection[]> = {
  hero: [
    {
      id: 'hero-1',
      type: 'hero',
      // name: 'Hero - Centered',
      content: {
        title: 'Welcome to Your Offer',
        subtitle: 'Get started in just a few clicks',
        description: 'Join thousands of satisfied customers',
        buttonText: 'Get Started',
        buttonLink: '#',
        imageUrl: '',
        alignment: 'center'
      },
      styles: {
        padding: { top: 80, right: 20, bottom: 80, left: 20 },
        background: { type: 'color', value: '#f8f9fa' }
      },
      // order: 0
    },
    {
      id: 'hero-2',
      type: 'hero',
      // name: 'Hero - Split',
      content: {
        title: 'Transform Your Business',
        subtitle: 'Start your journey today',
        description: 'Professional solutions for modern challenges',
        buttonText: 'Learn More',
        buttonLink: '#',
        imageUrl: '',
        alignment: 'left'
      },
      styles: {
        padding: { top: 60, right: 20, bottom: 60, left: 20 },
        background: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
      },
      // order: 0
    }
  ],
  content: [
    {
      id: 'content-1',
      type: 'text',
      // name: 'Text Block',
      content: {
        title: 'About Our Service',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        alignment: 'left'
      },
      styles: {
        padding: { top: 40, right: 20, bottom: 40, left: 20 },
        background: { type: 'color', value: '#ffffff' }
      },
      // order: 1
    },
    {
      id: 'content-2',
      type: 'features',
      // name: 'Feature Grid',
      content: {
        title: 'Key Features',
        features: [
          { icon: 'Check', title: 'Feature 1', description: 'Description here' },
          { icon: 'Check', title: 'Feature 2', description: 'Description here' },
          { icon: 'Check', title: 'Feature 3', description: 'Description here' }
        ]
      },
      styles: {
        padding: { top: 60, right: 20, bottom: 60, left: 20 },
        background: { type: 'color', value: '#f8f9fa' }
      },
      // order: 2
    }
  ],
  cta: [
    {
      id: 'cta-1',
      type: 'cta',
      // name: 'CTA - Primary',
      content: {
        title: 'Ready to Get Started?',
        description: 'Join now and get instant access',
        buttonText: 'Sign Up Now',
        buttonLink: '#',
        alignment: 'center'
      },
      styles: {
        padding: { top: 60, right: 20, bottom: 60, left: 20 },
        background: { type: 'color', value: '#3b82f6' }
      },
      // order: 3
    }
  ],
  testimonial: [
    {
      id: 'testimonial-1',
      type: 'testimonial',
      // name: 'Testimonial Slider',
      content: {
        title: 'What Our Customers Say',
        testimonials: [
          {
            quote: 'This service changed my life!',
            author: 'John Doe',
            role: 'CEO, Company Inc',
            imageUrl: ''
          }
        ]
      },
      styles: {
        padding: { top: 60, right: 20, bottom: 60, left: 20 },
        background: { type: 'color', value: '#ffffff' }
      },
      // order: 4
    }
  ],
  form: [
    {
      id: 'form-1',
      type: 'form',
      // name: 'Contact Form',
      content: {
        title: 'Contact Us',
        description: 'Fill out the form below and we will get back to you',
        fields: [
          { type: 'text', label: 'Name', required: true },
          { type: 'email', label: 'Email', required: true },
          { type: 'textarea', label: 'Message', required: true }
        ],
        buttonText: 'Submit'
      },
      styles: {
        padding: { top: 60, right: 20, bottom: 60, left: 20 },
        background: { type: 'color', value: '#f8f9fa' }
      },
      // order: 5
    }
  ],
  footer: [
    {
      id: 'footer-1',
      type: 'footer',
      // name: 'Simple Footer',
      content: {
        copyright: '© 2025 Your Company. All rights reserved.',
        links: [
          { text: 'Privacy Policy', url: '#' },
          { text: 'Terms of Service', url: '#' },
          { text: 'Contact', url: '#' }
        ]
      },
      styles: {
        padding: { top: 40, right: 20, bottom: 40, left: 20 },
        background: { type: 'color', value: '#1f2937' }
      },
      // order: 6
    }
  ]
};
