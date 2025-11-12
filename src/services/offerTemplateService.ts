import { supabase } from '../lib/supabase';
import type { OfferTemplate, OfferTheme, OfferVersion, MediaAsset } from '../types/inhouseOffer';

export async function getAllTemplates(): Promise<OfferTemplate[]> {
  const { data, error } = await supabase
    .from('offer_templates')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('usage_count', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTemplatesByVertical(vertical: string): Promise<OfferTemplate[]> {
  const { data, error } = await supabase
    .from('offer_templates')
    .select('*')
    .eq('vertical', vertical)
    .order('usage_count', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function incrementTemplateUsage(templateId: string): Promise<void> {
  const { data: template } = await supabase
    .from('offer_templates')
    .select('usage_count')
    .eq('id', templateId)
    .single();

  if (template) {
    await supabase
      .from('offer_templates')
      .update({ usage_count: template.usage_count + 1 })
      .eq('id', templateId);
  }
}

export async function getAllThemes(): Promise<OfferTheme[]> {
  const { data, error } = await supabase
    .from('offer_themes')
    .select('*')
    .order('is_default', { ascending: false });

  if (error) throw error;
  return (data || []).map(t => ({
    ...t.theme_config,
    name: t.name,
  }));
}

export async function getDefaultTheme(): Promise<OfferTheme | null> {
  const { data, error } = await supabase
    .from('offer_themes')
    .select('*')
    .eq('is_default', true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data.theme_config,
    name: data.name,
  };
}

export async function createOfferVersion(
  offerId: string,
  offerSnapshot: any,
  stepsSnapshot: any[],
  status: OfferVersion['published_status'] = 'draft'
): Promise<OfferVersion> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existingVersions } = await supabase
    .from('offer_versions')
    .select('version_number')
    .eq('offer_id', offerId)
    .order('version_number', { ascending: false })
    .limit(1);

  const nextVersion = existingVersions && existingVersions.length > 0
    ? existingVersions[0].version_number + 1
    : 1;

  const { data, error } = await supabase
    .from('offer_versions')
    .insert({
      offer_id: offerId,
      version_number: nextVersion,
      offer_snapshot: offerSnapshot,
      steps_snapshot: stepsSnapshot,
      published_status: status,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOfferVersions(offerId: string): Promise<OfferVersion[]> {
  const { data, error } = await supabase
    .from('offer_versions')
    .select('*')
    .eq('offer_id', offerId)
    .order('version_number', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function publishOfferVersion(
  versionId: string,
  publishUrl?: string,
  scheduledFor?: string
): Promise<OfferVersion> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updates: any = {
    published_status: scheduledFor ? 'scheduled' : 'published',
    published_by: user.id,
    updated_at: new Date().toISOString(),
  };

  if (!scheduledFor) {
    updates.published_at = new Date().toISOString();
  } else {
    updates.scheduled_for = scheduledFor;
  }

  if (publishUrl) {
    updates.publish_url = publishUrl;
  }

  const { data, error } = await supabase
    .from('offer_versions')
    .update(updates)
    .eq('id', versionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadMedia(
  file: File,
  offerId?: string,
  tags: string[] = []
): Promise<MediaAsset> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = offerId ? `offers/${offerId}/${fileName}` : `global/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('offer-media')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('offer-media')
    .getPublicUrl(filePath);

  const fileType = file.type.startsWith('image/') ? 'image' :
                   file.type.startsWith('video/') ? 'video' : 'document';

  let width, height;
  if (fileType === 'image') {
    const dimensions = await getImageDimensions(file);
    width = dimensions.width;
    height = dimensions.height;
  }

  const { data, error } = await supabase
    .from('offer_media_library')
    .insert({
      offer_id: offerId,
      file_name: file.name,
      file_url: publicUrl,
      file_type: fileType,
      mime_type: file.type,
      file_size: file.size,
      width,
      height,
      tags,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMediaLibrary(offerId?: string): Promise<MediaAsset[]> {
  let query = supabase
    .from('offer_media_library')
    .select('*')
    .order('created_at', { ascending: false });

  if (offerId) {
    query = query.or(`offer_id.eq.${offerId},offer_id.is.null`);
  } else {
    query = query.is('offer_id', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export async function searchStockPhotos(query: string, perPage: number = 20): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
      {
        headers: {
          Authorization: 'YOUR_PEXELS_API_KEY',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.photos || [];
  } catch (error) {
    console.error('Failed to fetch stock photos:', error);
    return [];
  }
}
