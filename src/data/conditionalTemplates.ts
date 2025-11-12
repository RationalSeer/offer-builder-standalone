export interface ConditionalTemplate {
  id: string;
  name: string;
  description: string;
  category: 'qualification' | 'routing' | 'disqualification';
  template: {
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    action: {
      type: string;
      target?: string;
    };
  };
}

export const conditionalTemplates: Record<string, ConditionalTemplate[]> = {
  qualification: [
    {
      id: 'age-qualify',
      name: 'Age Qualification',
      description: 'Qualify users based on age requirements',
      category: 'qualification',
      template: {
        conditions: [
          {
            field: 'age',
            operator: 'greater_than_or_equal',
            value: 18
          }
        ],
        action: {
          type: 'continue',
          target: 'next_step'
        }
      }
    },
    {
      id: 'income-qualify',
      name: 'Income Qualification',
      description: 'Qualify users based on income level',
      category: 'qualification',
      template: {
        conditions: [
          {
            field: 'annual_income',
            operator: 'greater_than',
            value: 30000
          }
        ],
        action: {
          type: 'continue',
          target: 'next_step'
        }
      }
    }
  ],
  routing: [
    {
      id: 'credit-score-routing',
      name: 'Credit Score Routing',
      description: 'Route users to different paths based on credit score',
      category: 'routing',
      template: {
        conditions: [
          {
            field: 'credit_score',
            operator: 'greater_than',
            value: 700
          }
        ],
        action: {
          type: 'jump_to_step',
          target: 'premium_offers'
        }
      }
    },
    {
      id: 'location-routing',
      name: 'Location-Based Routing',
      description: 'Route users based on their location',
      category: 'routing',
      template: {
        conditions: [
          {
            field: 'state',
            operator: 'equals',
            value: 'CA'
          }
        ],
        action: {
          type: 'jump_to_step',
          target: 'california_specific'
        }
      }
    }
  ],
  disqualification: [
    {
      id: 'age-disqualify',
      name: 'Age Disqualification',
      description: 'Disqualify users who do not meet age requirements',
      category: 'disqualification',
      template: {
        conditions: [
          {
            field: 'age',
            operator: 'less_than',
            value: 18
          }
        ],
        action: {
          type: 'disqualify',
          target: 'age_requirement_not_met'
        }
      }
    },
    {
      id: 'bankruptcy-disqualify',
      name: 'Bankruptcy Disqualification',
      description: 'Disqualify users with recent bankruptcy',
      category: 'disqualification',
      template: {
        conditions: [
          {
            field: 'bankruptcy_status',
            operator: 'equals',
            value: 'active'
          }
        ],
        action: {
          type: 'disqualify',
          target: 'bankruptcy_detected'
        }
      }
    }
  ]
};

export function applyTemplate(template: ConditionalTemplate) {
  return template.template;
}
