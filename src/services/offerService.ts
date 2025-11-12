import { supabase, checkUserAuthentication, getSupabaseErrorMessage } from '../lib/supabase';
import {
  InhouseOffer,
  OfferStep,
  OfferSession,
  OfferResponse,
  OfferAnalytics,
  EmailSubscriber,
  GeoData,
} from '../types/inhouseOffer';

const DEBUG = true;

function log(operation: string, details: any) {
  if (DEBUG) {
    console.log(`[OfferService:${operation}]`, details);
  }
}

function logError(operation: string, error: any, context?: any) {
  console.error(`[OfferService:${operation}] ERROR:`, {
    error,
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
    context,
  });
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateOfferData(offer: any): ValidationResult {
  const errors: string[] = [];

  if (!offer.name || typeof offer.name !== 'string' || offer.name.trim().length === 0) {
    errors.push('Offer name is required and must be a non-empty string');
  }

  if (!offer.slug || typeof offer.slug !== 'string' || offer.slug.trim().length === 0) {
    errors.push('Offer slug is required and must be a non-empty string');
  } else if (!/^[a-z0-9-]+$/.test(offer.slug)) {
    errors.push('Offer slug can only contain lowercase letters, numbers, and hyphens');
  }

  if (!offer.vertical || typeof offer.vertical !== 'string') {
    errors.push('Offer vertical is required');
  }

  if (offer.default_payout !== undefined && (isNaN(offer.default_payout) || offer.default_payout < 0)) {
    errors.push('Default payout must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateStepData(step: any): ValidationResult {
  const errors: string[] = [];

  if (!step.offer_id) {
    errors.push('Step must be associated with an offer (offer_id required)');
  }

  if (step.step_order === undefined || step.step_order === null || step.step_order < 0) {
    errors.push('Step order must be a non-negative number');
  }

  if (!step.step_type || typeof step.step_type !== 'string') {
    errors.push('Step type is required');
  }

  if (!step.question_text || typeof step.question_text !== 'string' || step.question_text.trim().length === 0) {
    errors.push('Question text is required and must be a non-empty string');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function createOffer(
  offer: Omit<InhouseOffer, 'id' | 'created_at' | 'updated_at' | 'created_by'>
): Promise<InhouseOffer> {
  const operation = 'createOffer';
  log(operation, { offerName: offer.name, slug: offer.slug });

  try {
    const authCheck = await checkUserAuthentication();
    if (!authCheck.authenticated) {
      const error = authCheck.error || 'You must be signed in to create an offer.';
      log(operation, { authCheck, result: 'not authenticated' });
      throw new Error(error);
    }

    log(operation, { userId: authCheck.user.id, email: authCheck.user.email });

    const validation = validateOfferData(offer);
    if (!validation.valid) {
      log(operation, { validationErrors: validation.errors });
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const insertData = {
      ...offer,
      created_by: authCheck.user.id,
    };

    log(operation, { insertData: { ...insertData, config: '<omitted>' } });

    const { data, error } = await supabase
      .from('inhouse_offers')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      logError(operation, error, { insertData: { name: offer.name, slug: offer.slug } });
      throw new Error(`Failed to create offer: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { success: true, offerId: data.id });
    return data;
  } catch (error: any) {
    logError(operation, error);
    throw error;
  }
}

export async function updateOffer(
  offerId: string,
  updates: Partial<InhouseOffer>
): Promise<InhouseOffer> {
  const operation = 'updateOffer';
  log(operation, { offerId, updates: Object.keys(updates) });

  try {
    const authCheck = await checkUserAuthentication();
    if (!authCheck.authenticated) {
      const error = authCheck.error || 'You must be signed in to update an offer.';
      log(operation, { result: 'not authenticated' });
      throw new Error(error);
    }

    if (!offerId) {
      throw new Error('Offer ID is required.');
    }

    log(operation, { userId: authCheck.user.id, offerId });

    const { data: existing, error: checkError } = await supabase
      .from('inhouse_offers')
      .select('id, name, created_by')
      .eq('id', offerId)
      .maybeSingle();

    if (checkError) {
      logError(operation, checkError, { offerId });
      throw new Error(`Failed to verify offer exists: ${getSupabaseErrorMessage(checkError)}`);
    }

    if (!existing) {
      log(operation, { result: 'offer not found', offerId });
      throw new Error('Offer not found. It may have been deleted.');
    }

    if (existing.created_by !== authCheck.user.id) {
      log(operation, { result: 'permission denied', offerId, userId: authCheck.user.id });
      throw new Error('Permission denied. You can only update offers you created.');
    }

    const { data, error } = await supabase
      .from('inhouse_offers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', offerId)
      .select()
      .single();

    if (error) {
      logError(operation, error, { offerId, updates: Object.keys(updates) });
      throw new Error(`Failed to update offer: ${getSupabaseErrorMessage(error)}`);
    }

    if (!data) {
      throw new Error('Offer not found or you do not have permission to update it.');
    }

    log(operation, { success: true, offerId, updatedFields: Object.keys(updates) });
    return data;
  } catch (error: any) {
    logError(operation, error, { offerId });
    throw error;
  }
}

export async function deleteOffer(offerId: string): Promise<void> {
  const operation = 'deleteOffer';
  log(operation, { offerId });

  try {
    if (!offerId) {
      throw new Error('Offer ID is required.');
    }

    const authCheck = await checkUserAuthentication();
    if (!authCheck.authenticated) {
      throw new Error(authCheck.error || 'You must be signed in to delete an offer.');
    }

    const { data: existing, error: checkError } = await supabase
      .from('inhouse_offers')
      .select('id, created_by')
      .eq('id', offerId)
      .maybeSingle();

    if (checkError) {
      logError(operation, checkError, { offerId });
      throw new Error(`Failed to verify offer exists: ${getSupabaseErrorMessage(checkError)}`);
    }

    if (!existing) {
      throw new Error('Offer not found.');
    }

    if (existing.created_by !== authCheck.user.id) {
      throw new Error('Permission denied. You can only delete offers you created.');
    }

    const { error } = await supabase
      .from('inhouse_offers')
      .delete()
      .eq('id', offerId);

    if (error) {
      logError(operation, error, { offerId });
      throw new Error(`Failed to delete offer: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { success: true, offerId });
  } catch (error: any) {
    logError(operation, error, { offerId });
    throw error;
  }
}

export async function getOfferBySlug(slug: string): Promise<InhouseOffer | null> {
  const operation = 'getOfferBySlug';
  log(operation, { slug });

  try {
    if (!slug) {
      throw new Error('Slug is required.');
    }

    const { data, error } = await supabase
      .from('inhouse_offers')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      logError(operation, error, { slug });
      throw new Error(`Failed to fetch offer by slug: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { found: !!data, slug });
    return data;
  } catch (error: any) {
    logError(operation, error, { slug });
    throw error;
  }
}

export async function getAllOffers(): Promise<InhouseOffer[]> {
  const operation = 'getAllOffers';
  log(operation, {});

  try {
    const { data, error } = await supabase
      .from('inhouse_offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logError(operation, error);
      throw new Error(`Failed to fetch offers: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { count: data?.length || 0 });
    return data || [];
  } catch (error: any) {
    logError(operation, error);
    throw error;
  }
}

export async function createOfferStep(
  step: Omit<OfferStep, 'id' | 'created_at' | 'updated_at'>
): Promise<OfferStep> {
  const operation = 'createOfferStep';
  log(operation, { offerId: step.offer_id, stepType: step.step_type, stepOrder: step.step_order });

  try {
    const authCheck = await checkUserAuthentication();
    if (!authCheck.authenticated) {
      const error = authCheck.error || 'You must be signed in to create offer steps.';
      log(operation, { result: 'not authenticated' });
      throw new Error(error);
    }

    const validation = validateStepData(step);
    if (!validation.valid) {
      log(operation, { validationErrors: validation.errors });
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const { data: offer, error: offerError } = await supabase
      .from('inhouse_offers')
      .select('id, created_by')
      .eq('id', step.offer_id)
      .maybeSingle();

    if (offerError) {
      logError(operation, offerError, { offerId: step.offer_id });
      throw new Error(`Failed to verify offer exists: ${getSupabaseErrorMessage(offerError)}`);
    }

    if (!offer) {
      throw new Error(`Offer ${step.offer_id} not found. Cannot create step for non-existent offer.`);
    }

    if (offer.created_by !== authCheck.user.id) {
      log(operation, { result: 'permission denied', offerId: step.offer_id });
      throw new Error('Permission denied. You can only create steps for offers you created.');
    }

    const { data, error } = await supabase
      .from('offer_steps')
      .insert(step)
      .select()
      .single();

    if (error) {
      logError(operation, error, { offerId: step.offer_id, stepType: step.step_type });
      throw new Error(`Failed to create offer step: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { success: true, stepId: data.id, offerId: step.offer_id });
    return data;
  } catch (error: any) {
    logError(operation, error, { offerId: step.offer_id });
    throw error;
  }
}

export async function updateOfferStep(
  stepId: string,
  updates: Partial<OfferStep>
): Promise<OfferStep> {
  const operation = 'updateOfferStep';
  log(operation, { stepId, updates: Object.keys(updates) });

  try {
    const authCheck = await checkUserAuthentication();
    if (!authCheck.authenticated) {
      const error = authCheck.error || 'You must be signed in to update offer steps.';
      log(operation, { result: 'not authenticated' });
      throw new Error(error);
    }

    if (!stepId) {
      throw new Error('Step ID is required.');
    }

    const { data: step, error: stepError } = await supabase
      .from('offer_steps')
      .select('id, offer_id')
      .eq('id', stepId)
      .maybeSingle();

    if (stepError) {
      logError(operation, stepError, { stepId });
      throw new Error(`Failed to verify step exists: ${getSupabaseErrorMessage(stepError)}`);
    }

    if (!step) {
      throw new Error('Step not found. It may have been deleted.');
    }

    const { data: offer, error: offerError } = await supabase
      .from('inhouse_offers')
      .select('id, created_by')
      .eq('id', step.offer_id)
      .maybeSingle();

    if (offerError || !offer) {
      throw new Error('Parent offer not found. Cannot update step for non-existent offer.');
    }

    if (offer.created_by !== authCheck.user.id) {
      log(operation, { result: 'permission denied', stepId });
      throw new Error('Permission denied. You can only update steps for offers you created.');
    }

    const { data, error } = await supabase
      .from('offer_steps')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', stepId)
      .select()
      .single();

    if (error) {
      logError(operation, error, { stepId, updates: Object.keys(updates) });
      throw new Error(`Failed to update offer step: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { success: true, stepId, updatedFields: Object.keys(updates) });
    return data;
  } catch (error: any) {
    logError(operation, error, { stepId });
    throw error;
  }
}

export async function deleteOfferStep(stepId: string): Promise<void> {
  const operation = 'deleteOfferStep';
  log(operation, { stepId });

  try {
    if (!stepId) {
      throw new Error('Step ID is required.');
    }

    const authCheck = await checkUserAuthentication();
    if (!authCheck.authenticated) {
      throw new Error(authCheck.error || 'You must be signed in to delete offer steps.');
    }

    const { data: step, error: stepError } = await supabase
      .from('offer_steps')
      .select('id, offer_id')
      .eq('id', stepId)
      .maybeSingle();

    if (stepError) {
      logError(operation, stepError, { stepId });
      throw new Error(`Failed to verify step exists: ${getSupabaseErrorMessage(stepError)}`);
    }

    if (!step) {
      throw new Error('Step not found.');
    }

    const { data: offer } = await supabase
      .from('inhouse_offers')
      .select('created_by')
      .eq('id', step.offer_id)
      .maybeSingle();

    if (offer && offer.created_by !== authCheck.user.id) {
      throw new Error('Permission denied. You can only delete steps for offers you created.');
    }

    const { error } = await supabase
      .from('offer_steps')
      .delete()
      .eq('id', stepId);

    if (error) {
      logError(operation, error, { stepId });
      throw new Error(`Failed to delete offer step: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { success: true, stepId });
  } catch (error: any) {
    logError(operation, error, { stepId });
    throw error;
  }
}

export async function getOfferSteps(offerId: string): Promise<OfferStep[]> {
  const operation = 'getOfferSteps';
  log(operation, { offerId });

  try {
    if (!offerId) {
      throw new Error('Offer ID is required.');
    }

    const { data, error } = await supabase
      .from('offer_steps')
      .select('*')
      .eq('offer_id', offerId)
      .order('step_order', { ascending: true });

    if (error) {
      logError(operation, error, { offerId });
      throw new Error(`Failed to fetch offer steps: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { count: data?.length || 0, offerId });
    return data || [];
  } catch (error: any) {
    logError(operation, error, { offerId });
    throw error;
  }
}

export async function reorderSteps(offerId: string, stepIds: string[]): Promise<void> {
  const operation = 'reorderSteps';
  log(operation, { offerId, stepCount: stepIds.length });

  try {
    if (!offerId) {
      throw new Error('Offer ID is required.');
    }

    if (!Array.isArray(stepIds) || stepIds.length === 0) {
      throw new Error('Step IDs array is required and must not be empty.');
    }

    const authCheck = await checkUserAuthentication();
    if (!authCheck.authenticated) {
      throw new Error(authCheck.error || 'You must be signed in to reorder steps.');
    }

    const { data: offer } = await supabase
      .from('inhouse_offers')
      .select('created_by')
      .eq('id', offerId)
      .maybeSingle();

    if (!offer || offer.created_by !== authCheck.user.id) {
      throw new Error('Permission denied. You can only reorder steps for offers you created.');
    }

    for (let i = 0; i < stepIds.length; i++) {
      const { error } = await supabase
        .from('offer_steps')
        .update({ step_order: i, updated_at: new Date().toISOString() })
        .eq('id', stepIds[i])
        .eq('offer_id', offerId);

      if (error) {
        logError(operation, error, { offerId, stepId: stepIds[i], newOrder: i });
        throw new Error(`Failed to reorder step ${i}: ${getSupabaseErrorMessage(error)}`);
      }
    }

    log(operation, { success: true, offerId, stepsReordered: stepIds.length });
  } catch (error: any) {
    logError(operation, error, { offerId, stepCount: stepIds.length });
    throw error;
  }
}

export async function saveAllOfferSteps(offerId: string, steps: OfferStep[]): Promise<OfferStep[]> {
  const operation = 'saveAllOfferSteps';
  log(operation, { offerId, stepCount: steps.length });

  const savedSteps: OfferStep[] = [];
  const errors: Array<{ step: any; error: any }> = [];

  try {
    const authCheck = await checkUserAuthentication();
    if (!authCheck.authenticated) {
      throw new Error(authCheck.error || 'You must be signed in to save offer steps.');
    }

    const { data: offer, error: offerError } = await supabase
      .from('inhouse_offers')
      .select('id, created_by')
      .eq('id', offerId)
      .maybeSingle();

    if (offerError) {
      logError(operation, offerError, { offerId });
      throw new Error(`Failed to verify offer exists: ${getSupabaseErrorMessage(offerError)}`);
    }

    if (!offer) {
      throw new Error(`Offer ${offerId} not found.`);
    }

    if (offer.created_by !== authCheck.user.id) {
      throw new Error('Permission denied. You can only modify steps for offers you created.');
    }

    log(operation, { phase: 'fetch existing steps' });
    const existingSteps = await getOfferSteps(offerId);
    const existingStepIds = new Set(existingSteps.map(s => s.id));

    const stepsToDelete = existingSteps.filter(
      existing => !steps.find(s => s.id === existing.id && !s.id.startsWith('temp-'))
    );

    log(operation, { phase: 'delete orphaned steps', count: stepsToDelete.length });
    for (const stepToDelete of stepsToDelete) {
      try {
        await deleteOfferStep(stepToDelete.id);
      } catch (error: any) {
        logError(operation, error, { phase: 'delete step', stepId: stepToDelete.id });
        errors.push({ step: stepToDelete, error });
      }
    }

    log(operation, { phase: 'create/update steps', count: steps.length });
    for (const step of steps) {
      try {
        if (step.id.startsWith('temp-')) {
          log(operation, { action: 'create', stepOrder: step.step_order });
          const newStep = await createOfferStep({
            offer_id: offerId,
            step_order: step.step_order,
            step_type: step.step_type,
            question_text: step.question_text,
            options: step.options,
            validation_rules: step.validation_rules,
            conditional_logic: step.conditional_logic,
            placeholder_text: step.placeholder_text,
            help_text: step.help_text,
            field_mapping: step.field_mapping,
            element_styles: step.element_styles,
            text_alignment: step.text_alignment,
            font_settings: step.font_settings,
            step_layout: step.step_layout,
            step_background: step.step_background,
            step_image_url: step.step_image_url,
            step_icon: step.step_icon,
            animation_type: step.animation_type,
            custom_css: step.custom_css,
          });
          savedSteps.push(newStep);
        } else {
          log(operation, { action: 'update', stepId: step.id, stepOrder: step.step_order });
          const updatedStep = await updateOfferStep(step.id, {
            step_order: step.step_order,
            step_type: step.step_type,
            question_text: step.question_text,
            options: step.options,
            validation_rules: step.validation_rules,
            conditional_logic: step.conditional_logic,
            placeholder_text: step.placeholder_text,
            help_text: step.help_text,
            field_mapping: step.field_mapping,
            element_styles: step.element_styles,
            text_alignment: step.text_alignment,
            font_settings: step.font_settings,
            step_layout: step.step_layout,
            step_background: step.step_background,
            step_image_url: step.step_image_url,
            step_icon: step.step_icon,
            animation_type: step.animation_type,
            custom_css: step.custom_css,
          });
          savedSteps.push(updatedStep);
        }
      } catch (error: any) {
        logError(operation, error, { phase: 'save step', stepOrder: step.step_order });
        errors.push({ step, error });
      }
    }

    if (errors.length > 0) {
      log(operation, { completed: true, savedCount: savedSteps.length, errorCount: errors.length });
      throw new Error(
        `Saved ${savedSteps.length} steps but encountered ${errors.length} errors. ` +
        `First error: ${errors[0].error.message}`
      );
    }

    log(operation, { success: true, offerId, savedCount: savedSteps.length });
    return savedSteps;
  } catch (error: any) {
    logError(operation, error, { offerId, attemptedSteps: steps.length, savedSteps: savedSteps.length });
    throw error;
  }
}

export async function getOfferById(offerId: string): Promise<InhouseOffer | null> {
  const operation = 'getOfferById';
  log(operation, { offerId });

  try {
    if (!offerId) {
      throw new Error('Offer ID is required.');
    }

    const { data, error } = await supabase
      .from('inhouse_offers')
      .select('*')
      .eq('id', offerId)
      .maybeSingle();

    if (error) {
      logError(operation, error, { offerId });
      throw new Error(`Failed to fetch offer: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { found: !!data, offerId });
    return data;
  } catch (error: any) {
    logError(operation, error, { offerId });
    throw error;
  }
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export async function createOfferSession(
  offerId: string,
  trackingData: Partial<OfferSession>
): Promise<OfferSession> {
  const operation = 'createOfferSession';
  const sessionId = generateSessionId();

  log(operation, { offerId, sessionId, hasTrackingData: !!trackingData });

  try {
    const insertData = {
      session_id: sessionId,
      offer_id: offerId,
      status: 'started',
      current_step: 0,
      ...trackingData,
    };

    log(operation, { insertData: { ...insertData, user_agent: '<omitted>' } });

    const { data, error } = await supabase
      .from('offer_sessions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      logError(operation, error, { offerId, sessionId });
      throw new Error(`Failed to create offer session: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { success: true, sessionId, offerId });
    return data;
  } catch (error: any) {
    logError(operation, error, { offerId, sessionId });
    throw error;
  }
}

export async function updateOfferSession(
  sessionId: string,
  updates: Partial<OfferSession>
): Promise<OfferSession> {
  const operation = 'updateOfferSession';
  log(operation, { sessionId, updates: Object.keys(updates) });

  try {
    if (!sessionId) {
      throw new Error('Session ID is required.');
    }

    const { data, error } = await supabase
      .from('offer_sessions')
      .update({ ...updates, last_activity_at: new Date().toISOString() })
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error) {
      logError(operation, error, { sessionId, updates: Object.keys(updates) });
      throw new Error(`Failed to update session: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { success: true, sessionId });
    return data;
  } catch (error: any) {
    logError(operation, error, { sessionId });
    throw error;
  }
}

export async function getOfferSession(sessionId: string): Promise<OfferSession | null> {
  const operation = 'getOfferSession';
  log(operation, { sessionId });

  try {
    if (!sessionId) {
      throw new Error('Session ID is required.');
    }

    const { data, error } = await supabase
      .from('offer_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      logError(operation, error, { sessionId });
      throw new Error(`Failed to fetch session: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { found: !!data, sessionId });
    return data;
  } catch (error: any) {
    logError(operation, error, { sessionId });
    throw error;
  }
}

export async function saveOfferResponse(
  response: Omit<OfferResponse, 'id' | 'created_at'>
): Promise<OfferResponse> {
  const operation = 'saveOfferResponse';
  log(operation, { sessionId: response.session_id, stepId: response.step_id });

  try {
    if (!response.session_id) {
      throw new Error('Session ID is required.');
    }

    if (!response.step_id) {
      throw new Error('Step ID is required.');
    }

    const { data, error } = await supabase
      .from('offer_responses')
      .insert(response)
      .select()
      .single();

    if (error) {
      logError(operation, error, { sessionId: response.session_id, stepId: response.step_id });
      throw new Error(`Failed to save response: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { success: true, responseId: data.id, sessionId: response.session_id });
    return data;
  } catch (error: any) {
    logError(operation, error, { sessionId: response.session_id, stepId: response.step_id });
    throw error;
  }
}

export async function getSessionResponses(sessionId: string): Promise<OfferResponse[]> {
  const operation = 'getSessionResponses';
  log(operation, { sessionId });

  try {
    if (!sessionId) {
      throw new Error('Session ID is required.');
    }

    const { data, error } = await supabase
      .from('offer_responses')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      logError(operation, error, { sessionId });
      throw new Error(`Failed to fetch responses: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { count: data?.length || 0, sessionId });
    return data || [];
  } catch (error: any) {
    logError(operation, error, { sessionId });
    throw error;
  }
}

export async function completeOfferSession(
  sessionId: string,
  offerId: string
): Promise<string> {
  const operation = 'completeOfferSession';
  log(operation, { sessionId, offerId });

  try {
    if (!sessionId || !offerId) {
      throw new Error('Session ID and Offer ID are required.');
    }

    log(operation, { phase: 'fetch session' });
    const session = await getOfferSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    log(operation, { phase: 'fetch responses' });
    const responses = await getSessionResponses(sessionId);

    log(operation, { phase: 'fetch steps' });
    const steps = await getOfferSteps(offerId);

    log(operation, { phase: 'build form data', responseCount: responses.length, stepCount: steps.length });
    const formData: Record<string, any> = {};
    const responseMap = new Map(responses.map(r => [r.step_id, r]));

    steps.forEach(step => {
      const response = responseMap.get(step.id);
      if (response && step.field_mapping) {
        formData[step.field_mapping] = response.response_text || response.response_value;
      }
    });

    const qualityScore = calculateQualityScore(responses, steps);
    log(operation, { qualityScore, formFieldCount: Object.keys(formData).length });

    log(operation, { phase: 'create lead' });
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        landing_page_id: null,
        offer_id: null,
        form_data: formData,
        utm_params: {
          utm_source: session.utm_source,
          utm_medium: session.utm_medium,
          utm_campaign: session.utm_campaign,
          utm_term: session.utm_term,
          utm_content: session.utm_content,
        },
        quality_score: qualityScore,
        status: 'new',
        ip_address: session.ip_address,
        user_agent: session.user_agent,
      })
      .select()
      .single();

    if (leadError) {
      logError(operation, leadError, { phase: 'create lead', sessionId, offerId });
      throw new Error(`Failed to create lead: ${getSupabaseErrorMessage(leadError)}`);
    }

    log(operation, { phase: 'update session status', leadId: lead.id });
    await updateOfferSession(sessionId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      lead_id: lead.id,
    });

    if (formData.email) {
      log(operation, { phase: 'add email subscriber', email: formData.email });
      try {
        await addEmailSubscriber({
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          offer_id: offerId,
          session_id: sessionId,
          vertical: (await getOfferBySlug(offerId))?.vertical,
        });
      } catch (error: any) {
        logError(operation, error, { phase: 'add email subscriber (non-critical)' });
      }
    }

    log(operation, { phase: 'update analytics' });
    try {
      await updateOfferAnalytics(offerId, session);
    } catch (error: any) {
      logError(operation, error, { phase: 'update analytics (non-critical)' });
    }

    log(operation, { success: true, leadId: lead.id, sessionId, offerId });
    return lead.id;
  } catch (error: any) {
    logError(operation, error, { sessionId, offerId });
    throw error;
  }
}

function calculateQualityScore(responses: OfferResponse[], steps: OfferStep[]): number {
  const requiredSteps = steps.filter(s => s.validation_rules?.required);
  const answeredRequired = responses.filter(r =>
    requiredSteps.some(s => s.id === r.step_id)
  ).length;

  const completionScore = requiredSteps.length > 0
    ? (answeredRequired / requiredSteps.length) * 0.6
    : 0.6;

  const avgTimeScore = responses.length > 0
    ? Math.min(
        responses.reduce((sum, r) => sum + (r.time_spent_seconds || 0), 0) / responses.length / 30,
        0.2
      )
    : 0;

  const responseQuality = responses.filter(r =>
    r.response_text && r.response_text.length > 3
  ).length / Math.max(responses.length, 1) * 0.2;

  return Math.min(completionScore + avgTimeScore + responseQuality, 1);
}

export async function addEmailSubscriber(
  subscriber: Omit<EmailSubscriber, 'id' | 'created_at' | 'updated_at' | 'tags' | 'subscription_status' | 'subscription_date' | 'engagement_score' | 'metadata'>
): Promise<EmailSubscriber | null> {
  const operation = 'addEmailSubscriber';
  log(operation, { email: subscriber.email });

  try {
    if (!subscriber.email) {
      throw new Error('Email is required.');
    }

    const { data: existing } = await supabase
      .from('email_subscribers')
      .select('id')
      .eq('email', subscriber.email)
      .maybeSingle();

    if (existing) {
      log(operation, { result: 'already exists', email: subscriber.email });
      return null;
    }

    const { data, error } = await supabase
      .from('email_subscribers')
      .insert({
        ...subscriber,
        tags: [subscriber.vertical || 'general'],
        subscription_status: 'active',
        subscription_date: new Date().toISOString(),
        engagement_score: 50,
        metadata: {},
      })
      .select()
      .single();

    if (error) {
      logError(operation, error, { email: subscriber.email });
      throw new Error(`Failed to add email subscriber: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { success: true, subscriberId: data.id, email: subscriber.email });
    return data;
  } catch (error: any) {
    logError(operation, error, { email: subscriber.email });
    throw error;
  }
}

export async function getEmailSubscribers(
  filters?: { vertical?: string; status?: string; tags?: string[] }
): Promise<EmailSubscriber[]> {
  const operation = 'getEmailSubscribers';
  log(operation, { filters });

  try {
    let query = supabase
      .from('email_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.vertical) {
      query = query.eq('vertical', filters.vertical);
    }

    if (filters?.status) {
      query = query.eq('subscription_status', filters.status);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    const { data, error } = await query;

    if (error) {
      logError(operation, error, { filters });
      throw new Error(`Failed to fetch email subscribers: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { count: data?.length || 0 });
    return data || [];
  } catch (error: any) {
    logError(operation, error, { filters });
    throw error;
  }
}

export async function updateOfferAnalytics(
  offerId: string,
  session: OfferSession
): Promise<void> {
  const operation = 'updateOfferAnalytics';
  log(operation, { offerId, sessionStatus: session.status });

  try {
    if (!offerId) {
      throw new Error('Offer ID is required.');
    }

    const today = new Date().toISOString().split('T')[0];

    const { data: existing, error: fetchError } = await supabase
      .from('offer_analytics')
      .select('*')
      .eq('offer_id', offerId)
      .eq('date', today)
      .maybeSingle();

    if (fetchError) {
      logError(operation, fetchError, { phase: 'fetch existing', offerId, date: today });
      throw new Error(`Failed to fetch analytics: ${getSupabaseErrorMessage(fetchError)}`);
    }

    const responses = await getSessionResponses(session.session_id);
    const steps = await getOfferSteps(offerId);

    const stepDropOffs: Record<string, number> = {};
    if (session.status === 'abandoned') {
      const lastStep = responses.length > 0 ? responses[responses.length - 1].step_id : null;
      if (lastStep) {
        stepDropOffs[lastStep] = 1;
      }
    }

    const timeToComplete = session.completed_at
      ? Math.floor(
          (new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 1000
        )
      : 0;

    if (existing) {
      log(operation, { phase: 'update existing analytics', analyticsId: existing.id });
      const newSessionsCompleted = session.status === 'completed'
        ? existing.sessions_completed + 1
        : existing.sessions_completed;

      const newLeadsGenerated = session.status === 'completed' && session.lead_id
        ? existing.leads_generated + 1
        : existing.leads_generated;

      const totalSessions = existing.sessions_started;
      const newConversionRate = totalSessions > 0
        ? (newSessionsCompleted / totalSessions) * 100
        : 0;

      const totalTime = existing.avg_time_to_complete * existing.sessions_completed;
      const newAvgTime = newSessionsCompleted > 0
        ? (totalTime + timeToComplete) / newSessionsCompleted
        : 0;

      const { error } = await supabase
        .from('offer_analytics')
        .update({
          sessions_completed: newSessionsCompleted,
          leads_generated: newLeadsGenerated,
          conversion_rate: newConversionRate,
          avg_time_to_complete: Math.floor(newAvgTime),
          step_drop_offs: {
            ...existing.step_drop_offs,
            ...stepDropOffs,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        logError(operation, error, { phase: 'update', analyticsId: existing.id });
        throw new Error(`Failed to update analytics: ${getSupabaseErrorMessage(error)}`);
      }
    } else {
      log(operation, { phase: 'insert new analytics', offerId, date: today });
      const { error } = await supabase
        .from('offer_analytics')
        .insert({
          offer_id: offerId,
          date: today,
          total_views: 0,
          sessions_started: 1,
          sessions_completed: session.status === 'completed' ? 1 : 0,
          leads_generated: session.status === 'completed' && session.lead_id ? 1 : 0,
          leads_accepted: 0,
          leads_rejected: 0,
          total_revenue: 0,
          conversion_rate: session.status === 'completed' ? 100 : 0,
          avg_time_to_complete: timeToComplete,
          step_drop_offs: stepDropOffs,
        });

      if (error) {
        logError(operation, error, { phase: 'insert', offerId, date: today });
        throw new Error(`Failed to insert analytics: ${getSupabaseErrorMessage(error)}`);
      }
    }

    log(operation, { success: true, offerId, date: today });
  } catch (error: any) {
    logError(operation, error, { offerId, sessionId: session.session_id });
    throw error;
  }
}

export async function getOfferAnalytics(
  offerId: string,
  days: number = 30
): Promise<OfferAnalytics[]> {
  const operation = 'getOfferAnalytics';
  log(operation, { offerId, days });

  try {
    if (!offerId) {
      throw new Error('Offer ID is required.');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('offer_analytics')
      .select('*')
      .eq('offer_id', offerId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      logError(operation, error, { offerId, days });
      throw new Error(`Failed to fetch analytics: ${getSupabaseErrorMessage(error)}`);
    }

    log(operation, { count: data?.length || 0, offerId, days });
    return data || [];
  } catch (error: any) {
    logError(operation, error, { offerId, days });
    throw error;
  }
}

export async function cloneOffer(offerId: string, newName: string, newSlug: string): Promise<InhouseOffer> {
  const operation = 'cloneOffer';
  log(operation, { offerId, newName, newSlug });

  let createdOffer: InhouseOffer | null = null;
  const createdSteps: OfferStep[] = [];

  try {
    if (!offerId || !newName || !newSlug) {
      throw new Error('Offer ID, new name, and new slug are required.');
    }

    const authCheck = await checkUserAuthentication();
    if (!authCheck.authenticated) {
      throw new Error(authCheck.error || 'You must be signed in to clone an offer.');
    }

    log(operation, { phase: 'fetch source offer' });
    const { data: offer, error: offerError } = await supabase
      .from('inhouse_offers')
      .select('*')
      .eq('id', offerId)
      .single();

    if (offerError) {
      logError(operation, offerError, { phase: 'fetch source offer', offerId });
      throw new Error(`Failed to fetch source offer: ${getSupabaseErrorMessage(offerError)}`);
    }

    log(operation, { phase: 'fetch source steps' });
    const steps = await getOfferSteps(offerId);

    log(operation, { phase: 'create new offer', stepCount: steps.length });
    createdOffer = await createOffer({
      ...offer,
      name: newName,
      slug: newSlug,
      status: 'draft',
    });

    log(operation, { phase: 'clone steps', newOfferId: createdOffer.id });
    for (const step of steps) {
      const clonedStep = await createOfferStep({
        offer_id: createdOffer.id,
        step_order: step.step_order,
        step_type: step.step_type,
        question_text: step.question_text,
        options: step.options,
        validation_rules: step.validation_rules,
        conditional_logic: step.conditional_logic,
        placeholder_text: step.placeholder_text,
        help_text: step.help_text,
        field_mapping: step.field_mapping,
      });
      createdSteps.push(clonedStep);
    }

    log(operation, { success: true, newOfferId: createdOffer.id, clonedSteps: createdSteps.length });
    return createdOffer;
  } catch (error: any) {
    logError(operation, error, { offerId, newName, newSlug });

    if (createdOffer) {
      log(operation, { phase: 'rollback - deleting created offer', offerId: createdOffer.id });
      try {
        await deleteOffer(createdOffer.id);
        log(operation, { rollback: 'success' });
      } catch (rollbackError: any) {
        logError(operation, rollbackError, { phase: 'rollback failed', offerId: createdOffer.id });
      }
    }

    throw error;
  }
}
