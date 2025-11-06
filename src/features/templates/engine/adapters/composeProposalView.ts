import { supabase } from '@/integrations/supabase/client';
import { ProposalView } from '../schema';

/**
 * Adapter que compõe ProposalView a partir dos dados existentes no banco
 * NÃO altera tabelas existentes - apenas lê e transforma
 */
export async function composeProposalView(proposalId: string): Promise<ProposalView> {
  // Buscar proposta com relações
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select(`
      *,
      clients (name, email, phone, address),
      organizations (
        name,
        email,
        telefone,
        whatsapp,
        cnpj,
        rua,
        numero,
        bairro,
        cidade,
        estado,
        cep
      ),
      profiles!proposals_user_id_fkey (name, email, phone)
    `)
    .eq('id', proposalId)
    .single();

  if (proposalError || !proposal) {
    throw new Error('Proposta não encontrada');
  }

  // Parsear items (já está em JSONB)
  const items = Array.isArray(proposal.items) ? proposal.items : [];

  // Transformar items para o formato esperado
  const transformedItems = items.map((item: any) => ({
    id: item.id || item.product_id,
    group: item.group || 'Geral',
    brand: item.brand ? {
      id: item.brand_id,
      name: item.brand,
    } : undefined,
    product: {
      id: item.product_id,
      name: item.product_name || item.name,
      model: item.model,
      sku: item.sku,
    },
    qty: Number(item.quantity || item.qty || 1),
    unitPrice: Number(item.unit_price || item.unitPrice || 0),
    subtotal: Number(item.subtotal || item.total_price || 0),
    simpleDescription: item.simple_description || item.simpleDescription,
    detailedDescription: item.full_description || item.detailedDescription,
    imageUrl: item.image_url || item.imageUrl,
  }));

  // Calcular totais
  const subtotal = transformedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const upgradesTotal = 0; // Será implementado quando houver upgrades
  const total = subtotal + upgradesTotal;

  // Compor endereço da organização
  const org = proposal.organizations as any;
  const orgAddress = org ? [
    org.rua,
    org.numero,
    org.bairro,
    org.cidade,
    org.estado,
    org.cep
  ].filter(Boolean).join(', ') : undefined;

  // Compor ProposalView
  const proposalView: ProposalView = {
    proposal: {
      id: proposal.id,
      code: proposal.id.substring(0, 8).toUpperCase(),
      title: proposal.title,
      issueDate: new Date(proposal.created_at).toISOString().split('T')[0],
      validityDays: 15,
      status: proposal.status,
      version: proposal.version || 1,
    },
    organization: {
      name: org?.name || 'Organização',
      email: org?.email,
      phone: org?.telefone,
      whatsapp: org?.whatsapp,
      cnpj: org?.cnpj,
      address: orgAddress,
    },
    client: {
      name: (proposal.clients as any)?.name || proposal.client_name,
      email: (proposal.clients as any)?.email,
      phone: (proposal.clients as any)?.phone,
      address: (proposal.clients as any)?.address,
    },
    salesperson: (proposal.profiles as any) ? {
      name: (proposal.profiles as any).name || proposal.created_by_name,
      email: (proposal.profiles as any).email,
      phone: (proposal.profiles as any).phone,
    } : undefined,
    items: transformedItems,
    upgrades: [], // Será implementado quando necessário
    payments: [], // Será implementado quando necessário
    notes: [], // Será implementado quando necessário
    totals: {
      subtotal,
      upgradesTotal,
      total,
      margin: proposal.margin ? Number(proposal.margin) : undefined,
    },
  };

  return proposalView;
}
