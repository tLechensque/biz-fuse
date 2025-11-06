import { BlockType } from './schema';
import { Cover } from '../blocks/Cover';
import { ItemsTable } from '../blocks/ItemsTable';
import { Upgrades } from '../blocks/Upgrades';
import { Totals } from '../blocks/Totals';
import { Payment } from '../blocks/Payment';
import { Notes } from '../blocks/Notes';
import { Acceptance } from '../blocks/Acceptance';
import { TextContent } from '../blocks/TextContent';
import { AboutCompany } from '../blocks/AboutCompany';
import { Services } from '../blocks/Services';
import { BackCover } from '../blocks/BackCover';

// Registry de blocos: mapeia tipo para componente
export const BLOCK_REGISTRY: Record<BlockType, React.ComponentType<any>> = {
  Cover,
  ItemsTable,
  Upgrades,
  Totals,
  Payment,
  Notes,
  Acceptance,
  TextContent,
  AboutCompany,
  Services,
  BackCover,
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
    type: 'TextContent',
    label: 'Texto Livre',
    description: 'Seção de conteúdo personalizado com texto livre',
    icon: 'AlignLeft',
    defaultProps: {
      title: 'Título da Seção',
      content: '<p>Adicione seu conteúdo aqui. Você pode usar variáveis como {{organization.name}}.</p>',
      alignment: 'left',
    },
  },
  {
    type: 'AboutCompany',
    label: 'Sobre a Empresa',
    description: 'Apresentação da empresa com logo e descrição',
    icon: 'Building2',
    defaultProps: {
      title: 'Sobre a Empresa',
      showLogo: true,
      content: '<p>A <strong>{{organization.name}}</strong> é especializada em soluções de tecnologia e automação.</p>',
    },
  },
  {
    type: 'Services',
    label: 'Serviços',
    description: 'Lista de serviços oferecidos',
    icon: 'Briefcase',
    defaultProps: {
      title: 'Nossos Serviços',
      layout: 'list',
      services: [
        'Instalação e Configuração',
        'Suporte Técnico',
        'Manutenção',
        'Treinamento',
        'Consultoria',
      ],
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
  {
    type: 'BackCover',
    label: 'Contracapa',
    description: 'Página final com informações de contato',
    icon: 'FileCheck',
    defaultProps: {
      showContact: true,
      content: '<p>Obrigado pela confiança!</p>',
    },
  },
];
