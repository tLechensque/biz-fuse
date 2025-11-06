import { BlockType } from './schema';
import { Cover } from '../blocks/Cover';
import { ItemsTable } from '../blocks/ItemsTable';
import { Upgrades } from '../blocks/Upgrades';
import { Totals } from '../blocks/Totals';
import { Payment } from '../blocks/Payment';
import { Notes } from '../blocks/Notes';
import { Acceptance } from '../blocks/Acceptance';

// Registry de blocos: mapeia tipo para componente
export const BLOCK_REGISTRY: Record<BlockType, React.ComponentType<any>> = {
  Cover,
  ItemsTable,
  Upgrades,
  Totals,
  Payment,
  Notes,
  Acceptance,
};

// Metadados dos blocos para o editor
export interface BlockMetadata {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  defaultProps?: Record<string, any>;
}

export const BLOCK_METADATA: BlockMetadata[] = [
  {
    type: 'Cover',
    label: 'Capa',
    description: 'Capa da proposta com logo, título e informações do cliente',
    icon: 'FileText',
    defaultProps: {
      showLogo: true,
      title: '{{proposal.title}}',
      subtitle: 'Pedido #{{proposal.code}} · Data {{proposal.issueDate}} · Validade {{proposal.validityDays}} dias úteis',
      showClient: true,
    },
  },
  {
    type: 'ItemsTable',
    label: 'Tabela de Itens',
    description: 'Lista de produtos/serviços com preços e descrições',
    icon: 'Table',
    defaultProps: {
      showDetails: false,
      showImages: true,
    },
  },
  {
    type: 'Upgrades',
    label: 'Upgrades',
    description: 'Opções adicionais/upgrades disponíveis',
    icon: 'ArrowUpCircle',
  },
  {
    type: 'Totals',
    label: 'Totais',
    description: 'Resumo financeiro com subtotais e total',
    icon: 'Calculator',
  },
  {
    type: 'Payment',
    label: 'Formas de Pagamento',
    description: 'Condições e opções de pagamento',
    icon: 'CreditCard',
  },
  {
    type: 'Notes',
    label: 'Observações',
    description: 'Notas e informações adicionais',
    icon: 'FileText',
  },
  {
    type: 'Acceptance',
    label: 'Aceite',
    description: 'Área de assinatura e validade da proposta',
    icon: 'CheckSquare',
  },
];
