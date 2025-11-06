import { z } from 'zod';

// ===== ProposalView (DTO de leitura - composição dos dados existentes) =====
export const ProposalItemSchema = z.object({
  id: z.string(),
  group: z.string().optional(),
  brand: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  product: z.object({
    id: z.string(),
    name: z.string(),
    model: z.string().optional(),
    sku: z.string().optional(),
  }),
  qty: z.number(),
  unitPrice: z.number(),
  subtotal: z.number(),
  simpleDescription: z.string().optional(),
  detailedDescription: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const UpgradeOptionSchema = z.object({
  name: z.string(),
  delta: z.number(),
  selected: z.boolean().default(false),
});

export const PaymentOptionSchema = z.object({
  label: z.string(),
  amount: z.number(),
  details: z.string().optional(),
  method: z.string().optional(),
});

export const ProposalViewSchema = z.object({
  proposal: z.object({
    id: z.string(),
    code: z.string(),
    title: z.string(),
    issueDate: z.string(),
    validityDays: z.number().default(15),
    status: z.string(),
    version: z.number().default(1),
  }),
  organization: z.object({
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    cnpj: z.string().optional(),
    address: z.string().optional(),
    logoUrl: z.string().optional(),
  }),
  client: z.object({
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }),
  salesperson: z.object({
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  items: z.array(ProposalItemSchema),
  upgrades: z.array(UpgradeOptionSchema).default([]),
  payments: z.array(PaymentOptionSchema).default([]),
  notes: z.array(z.string()).default([]),
  totals: z.object({
    subtotal: z.number(),
    upgradesTotal: z.number().default(0),
    total: z.number(),
    margin: z.number().optional(),
  }),
});

export type ProposalView = z.infer<typeof ProposalViewSchema>;
export type ProposalItem = z.infer<typeof ProposalItemSchema>;
export type UpgradeOption = z.infer<typeof UpgradeOptionSchema>;
export type PaymentOption = z.infer<typeof PaymentOptionSchema>;

// ===== Template Layout =====
export const BlockTypeSchema = z.enum([
  'Cover',
  'ItemsTable',
  'Upgrades',
  'Totals',
  'Payment',
  'Notes',
  'Acceptance',
  'TextContent',
  'AboutCompany',
  'Services',
  'BackCover',
]);

export const BlockSchema = z.object({
  type: BlockTypeSchema,
  props: z.record(z.any()).optional(),
});

// Layout settings para cabeçalho/rodapé e espaçamentos
export const LayoutSettingsSchema = z.object({
  header: z.object({
    enabled: z.boolean().default(false),
    content: z.string().optional(),
    height: z.string().default('60px'),
  }).optional(),
  footer: z.object({
    enabled: z.boolean().default(false),
    content: z.string().optional(),
    height: z.string().default('60px'),
  }).optional(),
  pageMargin: z.string().default('18mm'),
  blockSpacing: z.string().default('24px'),
});

// Theme expandido com mais opções
export const ThemeSchema = z.object({
  // Cores
  primary: z.string().default('#0E121B'),
  accent: z.string().default('#2B6CB0'),
  soft: z.string().default('#F4F6F9'),
  
  // Tipografia
  fontFamily: z.string().default('Inter, system-ui, sans-serif'),
  fontSizeBase: z.string().default('10pt'),
  fontSizeH1: z.string().default('28pt'),
  fontSizeH2: z.string().default('18pt'),
  lineHeight: z.string().default('1.5'),
  
  // Espaçamentos
  borderRadius: z.string().default('8px'),
  cardPadding: z.string().default('16px'),
});

export const TemplateLayoutSchema = z.object({
  name: z.string(),
  theme: ThemeSchema.optional(),
  layout: LayoutSettingsSchema.optional(),
  blocks: z.array(BlockSchema),
});

export type BlockType = z.infer<typeof BlockTypeSchema>;
export type Block = z.infer<typeof BlockSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type LayoutSettings = z.infer<typeof LayoutSettingsSchema>;
export type TemplateLayout = z.infer<typeof TemplateLayoutSchema>;

// ===== Render Context =====
export interface RenderContext {
  data: ProposalView;
  flags: Record<string, any>;
  theme?: Theme;
}
