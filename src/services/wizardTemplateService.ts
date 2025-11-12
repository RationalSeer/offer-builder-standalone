import { supabase } from '../lib/supabase';
import { WizardTemplate } from '../types/dynamicContent';

export async function getWizardTemplates(vertical?: string, goal?: string): Promise<WizardTemplate[]> {
  try {
    let query = supabase
      .from('offer_templates')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('usage_count', { ascending: false });

    if (vertical) {
      query = query.eq('vertical', vertical);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(template => ({
      id: template.id,
      vertical: template.vertical,
      goal: inferGoalFromTemplate(template),
      name: template.name,
      description: template.description || '',
      suggested_steps: template.steps_template || [],
      popularity_score: template.usage_count || 0,
      created_at: template.created_at,
      updated_at: template.updated_at,
    }));
  } catch (error) {
    console.error('Failed to fetch wizard templates:', error);
    return [];
  }
}

export async function incrementTemplateUsage(templateId: string): Promise<void> {
  try {
    await supabase.rpc('increment_template_usage', { template_id: templateId });
  } catch (error) {
    console.error('Failed to increment template usage:', error);
  }
}

function inferGoalFromTemplate(template: any): 'lead_gen' | 'qualification' | 'survey' | 'quiz' {
  const name = template.name.toLowerCase();
  const description = (template.description || '').toLowerCase();

  if (name.includes('quiz') || description.includes('quiz')) {
    return 'quiz';
  }
  if (name.includes('survey') || description.includes('survey')) {
    return 'survey';
  }
  if (name.includes('qualifier') || name.includes('qualification') || description.includes('qualify')) {
    return 'qualification';
  }

  return 'lead_gen';
}

