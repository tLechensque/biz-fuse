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
  subtotal: z.number(),
  simpleDescription: z.string().optional(),
  detailedDescription: z.string().optional(),
  imageUrl: z.string().optional(),
});

// ===== Upgrade Option (para seção Rede) =====
export const UpgradeOptionSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  description: z.string().min(1, 'Descrição obrigatória'),
  upgradeValue: z.number().min(0, 'Valor deve ser >= 0'),
  totalWithUpgrade: z.number(), // calculado automaticamente
});

// ===== Proposal Section =====
export const ProposalSectionSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  name: z.string().min(1, 'Nome da seção obrigatório'),
  order: z.number().default(0),
  visible: z.boolean().default(true),
  items: z.array(ProposalItemSchema).default([]),
  upgrades: z.array(UpgradeOptionSchema).default([]),
  subtotal: z.number().default(0),
  excludeFromPayment: z.boolean().default(false), // para Aspiração
  specialNote: z.string().optional(), // nota específica (ex: Aspiração)
});

// ===== Payment Condition =====
export const PaymentConditionSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  label: z.string().min(1, 'Label obrigatório'),
  amount: z.number().min(0, 'Valor deve ser >= 0'),
  details: z.string().optional(),
  methodId: z.string().optional(),
  methodName: z.string().optional(),
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
  
  // Sections
  sections: z.array(ProposalSectionSchema).min(1, 'Ao menos uma seção obrigatória'),
  
  // Payments
  paymentConditions: z.array(PaymentConditionSchema).default([]),
  
  // Notes
  notes: NotesSchema.default({}),
  
  // Flags
  showDetailedDescriptions: z.boolean().default(false),
});

// ===== Types =====
export type ProposalItem = z.infer<typeof ProposalItemSchema>;
export type UpgradeOption = z.infer<typeof UpgradeOptionSchema>;
export type ProposalSection = z.infer<typeof ProposalSectionSchema>;
export type PaymentCondition = z.infer<typeof PaymentConditionSchema>;
export type Notes = z.infer<typeof NotesSchema>;
export type ProposalEditorForm = z.infer<typeof ProposalEditorFormSchema>;

// ===== Default Sections (templates) =====
export const DEFAULT_SECTIONS: Partial<ProposalSection>[] = [
  { name: 'Home Theater e Som Ambiente', order: 0, visible: true },
  { name: 'Sistema de Rede', order: 1, visible: true },
  { name: 'Aspiração Central', order: 2, visible: true, excludeFromPayment: true },
  { name: 'Serviços', order: 3, visible: true },
];
