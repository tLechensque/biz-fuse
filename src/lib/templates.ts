import { supabase } from '@/integrations/supabase/client';
import { TemplateLayout } from '@/features/templates/engine/schema';
import defaultTemplate from '@/features/templates/sample/starvai-clean-a4.json';

/**
 * Busca o template padrão da organização
 * Se não houver, retorna o template hardcoded
 */
export async function getDefaultTemplate(
  organizationId: string
): Promise<TemplateLayout> {
  try {
    const { data, error } = await supabase
      .from('proposal_templates')
      .select('content')
      .eq('organization_id', organizationId)
      .eq('template_type', 'blocks')
      .eq('is_default', true)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // Fallback para template padrão
      return defaultTemplate as TemplateLayout;
    }

    return data.content as TemplateLayout;
  } catch (error) {
    console.warn('Error fetching default template, using fallback:', error);
    return defaultTemplate as TemplateLayout;
  }
}

/**
 * Busca um template específico por ID
 */
export async function getTemplateById(
  templateId: string
): Promise<TemplateLayout | null> {
  try {
    const { data, error } = await supabase
      .from('proposal_templates')
      .select('content')
      .eq('id', templateId)
      .eq('template_type', 'blocks')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data.content as TemplateLayout;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

/**
 * Lista todos os templates ativos de uma organização
 */
export async function listTemplates(organizationId: string) {
  const { data, error } = await supabase
    .from('proposal_templates')
    .select('id, name, description, is_default')
    .eq('organization_id', organizationId)
    .eq('template_type', 'blocks')
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('name');

  if (error) {
    console.error('Error listing templates:', error);
    return [];
  }

  return data;
}
