import { ProposalView } from './schema';

// Registry de variáveis mapeando os dados existentes para tokens
export interface VariableDefinition {
  path: string;
  label: string;
  description: string;
  group: string;
  isArray?: boolean;
}

export const VARIABLE_REGISTRY: VariableDefinition[] = [
  // Proposta
  { path: 'proposal.code', label: 'Código', description: 'Código/número da proposta', group: 'Proposta' },
  { path: 'proposal.title', label: 'Título', description: 'Título da proposta', group: 'Proposta' },
  { path: 'proposal.issueDate', label: 'Data de Emissão', description: 'Data de emissão', group: 'Proposta' },
  { path: 'proposal.validityDays', label: 'Validade (dias)', description: 'Dias de validade', group: 'Proposta' },
  { path: 'proposal.version', label: 'Versão', description: 'Versão da proposta', group: 'Proposta' },
  
  // Organização
  { path: 'organization.name', label: 'Nome', description: 'Nome da organização', group: 'Organização' },
  { path: 'organization.email', label: 'E-mail', description: 'E-mail da organização', group: 'Organização' },
  { path: 'organization.phone', label: 'Telefone', description: 'Telefone da organização', group: 'Organização' },
  { path: 'organization.whatsapp', label: 'WhatsApp', description: 'WhatsApp da organização', group: 'Organização' },
  { path: 'organization.cnpj', label: 'CNPJ', description: 'CNPJ da organização', group: 'Organização' },
  { path: 'organization.address', label: 'Endereço', description: 'Endereço da organização', group: 'Organização' },
  
  // Cliente
  { path: 'client.name', label: 'Nome', description: 'Nome do cliente', group: 'Cliente' },
  { path: 'client.email', label: 'E-mail', description: 'E-mail do cliente', group: 'Cliente' },
  { path: 'client.phone', label: 'Telefone', description: 'Telefone do cliente', group: 'Cliente' },
  { path: 'client.address', label: 'Endereço', description: 'Endereço do cliente', group: 'Cliente' },
  { path: 'client.city', label: 'Cidade', description: 'Cidade do cliente', group: 'Cliente' },
  { path: 'client.state', label: 'Estado', description: 'Estado do cliente', group: 'Cliente' },
  
  // Vendedor
  { path: 'salesperson.name', label: 'Nome', description: 'Nome do vendedor', group: 'Vendedor' },
  { path: 'salesperson.email', label: 'E-mail', description: 'E-mail do vendedor', group: 'Vendedor' },
  { path: 'salesperson.phone', label: 'Telefone', description: 'Telefone do vendedor', group: 'Vendedor' },
  
  // Itens (array)
  { path: 'items[].group', label: 'Grupo', description: 'Grupo do item', group: 'Itens', isArray: true },
  { path: 'items[].brand.name', label: 'Marca', description: 'Marca do produto', group: 'Itens', isArray: true },
  { path: 'items[].product.name', label: 'Produto', description: 'Nome do produto', group: 'Itens', isArray: true },
  { path: 'items[].product.model', label: 'Modelo', description: 'Modelo do produto', group: 'Itens', isArray: true },
  { path: 'items[].product.sku', label: 'SKU', description: 'SKU do produto', group: 'Itens', isArray: true },
  { path: 'items[].qty', label: 'Quantidade', description: 'Quantidade', group: 'Itens', isArray: true },
  { path: 'items[].unitPrice', label: 'Preço Unitário', description: 'Preço unitário', group: 'Itens', isArray: true },
  { path: 'items[].subtotal', label: 'Subtotal', description: 'Subtotal do item', group: 'Itens', isArray: true },
  { path: 'items[].simpleDescription', label: 'Descrição Simples', description: 'Descrição resumida', group: 'Itens', isArray: true },
  { path: 'items[].detailedDescription', label: 'Descrição Detalhada', description: 'Descrição completa', group: 'Itens', isArray: true },
  
  // Upgrades (array)
  { path: 'upgrades[].name', label: 'Nome', description: 'Nome do upgrade', group: 'Upgrades', isArray: true },
  { path: 'upgrades[].delta', label: 'Valor', description: 'Valor adicional', group: 'Upgrades', isArray: true },
  { path: 'upgrades[].selected', label: 'Selecionado', description: 'Se está selecionado', group: 'Upgrades', isArray: true },
  
  // Pagamentos (array)
  { path: 'payments[].label', label: 'Forma', description: 'Forma de pagamento', group: 'Pagamentos', isArray: true },
  { path: 'payments[].amount', label: 'Valor', description: 'Valor do pagamento', group: 'Pagamentos', isArray: true },
  { path: 'payments[].details', label: 'Detalhes', description: 'Detalhes do pagamento', group: 'Pagamentos', isArray: true },
  
  // Notas (array)
  { path: 'notes[]', label: 'Nota', description: 'Item de nota', group: 'Notas', isArray: true },
  
  // Totais
  { path: 'totals.subtotal', label: 'Subtotal', description: 'Subtotal dos itens', group: 'Totais' },
  { path: 'totals.upgradesTotal', label: 'Total Upgrades', description: 'Total de upgrades', group: 'Totais' },
  { path: 'totals.total', label: 'Total', description: 'Valor total', group: 'Totais' },
  { path: 'totals.margin', label: 'Margem', description: 'Margem de lucro', group: 'Totais' },
  
  // Flags (contexto)
  { path: 'flags.showDetails', label: 'Mostrar Detalhes', description: 'Exibir descrições detalhadas', group: 'Configurações' },
];

// Helper para resolver variáveis no texto
export function resolveVariables(
  text: string,
  data: ProposalView,
  flags: Record<string, any> = {}
): string {
  if (!text) return '';
  
  return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const trimmedPath = path.trim();
    
    // Resolver flags
    if (trimmedPath.startsWith('flags.')) {
      const flagKey = trimmedPath.substring(6);
      const value = flags[flagKey];
      return value !== undefined ? String(value) : match;
    }
    
    // Resolver paths do data
    try {
      const value = getNestedValue(data, trimmedPath);
      return value !== undefined && value !== null ? String(value) : match;
    } catch (error) {
      console.warn(`Variable not resolved: ${trimmedPath}`, error);
      return match;
    }
  });
}

// Helper para acessar valores aninhados
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

// Helper para formatar valores
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

// Helper para agrupar variáveis por grupo
export function getVariablesByGroup(): Record<string, VariableDefinition[]> {
  return VARIABLE_REGISTRY.reduce((acc, variable) => {
    if (!acc[variable.group]) {
      acc[variable.group] = [];
    }
    acc[variable.group].push(variable);
    return acc;
  }, {} as Record<string, VariableDefinition[]>);
}

// Interface para grupos de variáveis (para autocomplete e export)
export interface VariableGroup {
  label: string;
  variables: Array<{
    key: string;
    description: string;
    example?: string;
  }>;
}

// Grupos de variáveis formatados para export e autocomplete
export const VARIABLE_GROUPS: VariableGroup[] = [
  {
    label: 'Proposta',
    variables: [
      { key: 'proposal.code', description: 'Código/número da proposta', example: 'PROP-001' },
      { key: 'proposal.title', description: 'Título da proposta', example: 'Sistema de Automação Residencial' },
      { key: 'proposal.issueDate', description: 'Data de emissão', example: '2024-01-15' },
      { key: 'proposal.validityDays', description: 'Dias de validade', example: '15' },
      { key: 'proposal.version', description: 'Versão da proposta', example: '1' },
    ],
  },
  {
    label: 'Organização',
    variables: [
      { key: 'organization.name', description: 'Nome da organização', example: 'Starvai Tecnologia' },
      { key: 'organization.email', description: 'E-mail da organização', example: 'contato@starvai.com' },
      { key: 'organization.phone', description: 'Telefone da organização', example: '(11) 9999-9999' },
      { key: 'organization.whatsapp', description: 'WhatsApp da organização', example: '(11) 99999-9999' },
      { key: 'organization.cnpj', description: 'CNPJ da organização', example: '00.000.000/0001-00' },
      { key: 'organization.address', description: 'Endereço completo da organização' },
    ],
  },
  {
    label: 'Cliente',
    variables: [
      { key: 'client.name', description: 'Nome do cliente', example: 'João Silva' },
      { key: 'client.email', description: 'E-mail do cliente', example: 'joao@email.com' },
      { key: 'client.phone', description: 'Telefone do cliente', example: '(11) 9999-9999' },
      { key: 'client.address', description: 'Endereço do cliente' },
      { key: 'client.city', description: 'Cidade do cliente', example: 'São Paulo' },
      { key: 'client.state', description: 'Estado do cliente', example: 'SP' },
    ],
  },
  {
    label: 'Vendedor',
    variables: [
      { key: 'salesperson.name', description: 'Nome do vendedor', example: 'Maria Santos' },
      { key: 'salesperson.email', description: 'E-mail do vendedor' },
      { key: 'salesperson.phone', description: 'Telefone do vendedor' },
    ],
  },
  {
    label: 'Totais',
    variables: [
      { key: 'totals.subtotal', description: 'Subtotal dos itens', example: 'R$ 15.000,00' },
      { key: 'totals.upgradesTotal', description: 'Total de upgrades', example: 'R$ 2.500,00' },
      { key: 'totals.total', description: 'Valor total', example: 'R$ 17.500,00' },
      { key: 'totals.margin', description: 'Margem de lucro' },
    ],
  },
];
