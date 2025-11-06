import { z } from 'zod';

// ===== Proposal Section Item =====
export const ProposalItemSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  productId: z.string(),
  productName: z.string().min(1, 'Nome do produto obrigatório'),
  brandId: z.string().optional(),
  brandName: z.string().optional(),
  model: z.string().optional(),
  sku: z.string().optional(),
  qty: z.number().min(0.01, 'Quantidade deve ser maior que 0'),
  unitPrice: z.number().min(0, 'Preço unitário deve ser >= 0'),
  costPrice: z.number().optional(), // preço de custo
  discountEnabled: z.boolean().default(false),
  discountType: z.enum(['percentage', 'fixed']).default('percentage'), // tipo de desconto
  discountValue: z.number().min(0).default(0), // valor ou % de desconto
  subtotal: z.number(),
  simpleDescription: z.string().optional(),
  detailedDescription: z.string().optional(),
  imageUrl: z.string().optional(),
  // Upgrade: produto alternativo para upgrade
  upgradeProductId: z.string().optional(),
  upgradeProductName: z.string().optional(),
  upgradeUnitPrice: z.number().optional(),
  upgradeDelta: z.number().optional(), // diferença de preço
});

// ===== Proposal Section =====
export const ProposalSectionSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  name: z.string().min(1, 'Nome da seção obrigatório'),
  order: z.number().default(0),
  visible: z.boolean().default(true),
  items: z.array(ProposalItemSchema).default([]),
  subtotal: z.number().default(0),
  excludeFromPayment: z.boolean().default(false), // para Aspiração
  specialNote: z.string().optional(), // nota específica (ex: Aspiração)
});

// ===== Payment Condition =====
export const PaymentConditionSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  methodId: z.string().min(1, 'Forma de pagamento obrigatória'),
  methodName: z.string().optional(),
  installments: z.number().min(1, 'Parcelas deve ser >= 1').default(1),
  installmentValue: z.number().min(0, 'Valor da parcela deve ser >= 0'),
  totalValue: z.number().min(0, 'Valor total deve ser >= 0'),
  details: z.string().optional(),
});

// ===== Notes and Inclusions =====
export const NotesSchema = z.object({
  generalNotes: z.string().default(''),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
});

// ===== Full Proposal Editor Form =====
export const ProposalEditorFormSchema = z.object({
  // Header
  clientId: z.string().min(1, 'Cliente obrigatório'),
  title: z.string().min(1, 'Título obrigatório'),
  code: z.string().optional(),
  issueDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  validityDays: z.number().min(1, 'Validade deve ser >= 1 dia').default(3),
  status: z.enum(['DRAFT', 'SENT', 'APPROVED', 'REJECTED']).default('DRAFT'),
  
  // Sections
  sections: z.array(ProposalSectionSchema).default([]),
  
  // Payments
  paymentConditions: z.array(PaymentConditionSchema).default([]),
  
  // Notes
  notes: NotesSchema.default({}),
  
  // Flags
  showDetailedDescriptions: z.boolean().default(false),
});

// ===== Types =====
export type ProposalItem = z.infer<typeof ProposalItemSchema>;
export type ProposalSection = z.infer<typeof ProposalSectionSchema>;
export type PaymentCondition = z.infer<typeof PaymentConditionSchema>;
export type Notes = z.infer<typeof NotesSchema>;
export type ProposalEditorForm = z.infer<typeof ProposalEditorFormSchema>;

// ===== Default Sections (templates) =====
export const DEFAULT_SECTIONS: Partial<ProposalSection>[] = [
  { name: 'Home Theater e Som Ambiente', order: 0, visible: true, items: [], subtotal: 0 },
  { name: 'Sistema de Rede', order: 1, visible: true, items: [], subtotal: 0 },
  { name: 'Aspiração Central', order: 2, visible: true, excludeFromPayment: true, items: [], subtotal: 0 },
  { name: 'Serviços', order: 3, visible: true, items: [], subtotal: 0 },
];
