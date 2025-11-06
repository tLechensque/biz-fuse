import { z } from 'zod';

// ===== Props Schema para Elementos e Componentes =====

// Tipos base
export const AlignSchema = z.enum(['start', 'center', 'end', 'stretch']);
export const JustifySchema = z.enum(['start', 'center', 'end', 'between', 'around', 'evenly']);
export const DirectionSchema = z.enum(['row', 'column']);
export const ObjectFitSchema = z.enum(['cover', 'contain', 'fill', 'none', 'scale-down']);

// Estilos comuns
export const CommonStyleSchema = z.object({
  width: z.string().optional(),
  height: z.string().optional(),
  minWidth: z.string().optional(),
  minHeight: z.string().optional(),
  maxWidth: z.string().optional(),
  maxHeight: z.string().optional(),
  margin: z.string().optional(),
  padding: z.string().optional(),
  background: z.string().optional(),
  border: z.string().optional(),
  borderRadius: z.string().optional(),
  boxShadow: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  overflow: z.enum(['visible', 'hidden', 'scroll', 'auto']).optional(),
  zIndex: z.number().optional(),
});

// Binding de dados (variáveis)
export const DataBindingSchema = z.object({
  path: z.string(), // Ex: "client.name", "items[].qty"
  fallback: z.string().optional(),
  formatter: z.string().optional(), // Ex: "brl", "date", "upper"
});

// Condição de visibilidade
export const ConditionSchema = z.object({
  expression: z.string(), // Ex: "flags.showDetails", "items.length > 0"
  invert: z.boolean().default(false),
});

// ===== Primitivos =====

// Frame (Container)
export const FramePropsSchema = z.object({
  type: z.literal('Frame'),
  id: z.string().optional(),
  children: z.array(z.lazy(() => ElementSchema)),
  style: CommonStyleSchema.optional(),
  condition: ConditionSchema.optional(),
  pageBreak: z.enum(['auto', 'before', 'after', 'avoid']).optional(),
});

// Stack (Flexbox)
export const StackPropsSchema = z.object({
  type: z.literal('Stack'),
  id: z.string().optional(),
  direction: DirectionSchema.default('column'),
  gap: z.string().optional(),
  align: AlignSchema.optional(),
  justify: JustifySchema.optional(),
  wrap: z.boolean().default(false),
  children: z.array(z.lazy(() => ElementSchema)),
  style: CommonStyleSchema.optional(),
  condition: ConditionSchema.optional(),
});

// Grid
export const GridPropsSchema = z.object({
  type: z.literal('Grid'),
  id: z.string().optional(),
  cols: z.number().min(1).max(12).default(2),
  rows: z.number().optional(),
  gap: z.string().optional(),
  children: z.array(z.lazy(() => ElementSchema)),
  style: CommonStyleSchema.optional(),
  condition: ConditionSchema.optional(),
});

// Text
export const TextPropsSchema = z.object({
  type: z.literal('Text'),
  id: z.string().optional(),
  content: z.string().optional(),
  binding: DataBindingSchema.optional(),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  lineHeight: z.string().optional(),
  color: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
  style: CommonStyleSchema.optional(),
  condition: ConditionSchema.optional(),
});

// Image
export const ImagePropsSchema = z.object({
  type: z.literal('Image'),
  id: z.string().optional(),
  src: z.string().optional(),
  binding: DataBindingSchema.optional(),
  alt: z.string().optional(),
  objectFit: ObjectFitSchema.default('cover'),
  aspectRatio: z.string().optional(),
  style: CommonStyleSchema.optional(),
  condition: ConditionSchema.optional(),
});

// Table
export const TableColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  width: z.string().optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  binding: DataBindingSchema.optional(),
});

export const TablePropsSchema = z.object({
  type: z.literal('Table'),
  id: z.string().optional(),
  columns: z.array(TableColumnSchema),
  dataBinding: DataBindingSchema.optional(), // Ex: items[]
  style: CommonStyleSchema.optional(),
  condition: ConditionSchema.optional(),
});

// Divider
export const DividerPropsSchema = z.object({
  type: z.literal('Divider'),
  id: z.string().optional(),
  color: z.string().optional(),
  thickness: z.string().optional(),
  style: CommonStyleSchema.optional(),
  condition: ConditionSchema.optional(),
});

// Repeater (container que repete seus children)
export const RepeaterPropsSchema = z.object({
  type: z.literal('Repeater'),
  id: z.string().optional(),
  dataBinding: DataBindingSchema, // Ex: items[], payments[]
  children: z.array(z.lazy(() => ElementSchema)),
  style: CommonStyleSchema.optional(),
  condition: ConditionSchema.optional(),
});

// Union de todos os elementos
export const ElementSchema: z.ZodType<any> = z.union([
  FramePropsSchema,
  StackPropsSchema,
  GridPropsSchema,
  TextPropsSchema,
  ImagePropsSchema,
  TablePropsSchema,
  DividerPropsSchema,
  RepeaterPropsSchema,
]);

export type Element = z.infer<typeof ElementSchema>;
export type FrameProps = z.infer<typeof FramePropsSchema>;
export type StackProps = z.infer<typeof StackPropsSchema>;
export type GridProps = z.infer<typeof GridPropsSchema>;
export type TextProps = z.infer<typeof TextPropsSchema>;
export type ImageProps = z.infer<typeof ImagePropsSchema>;
export type TableProps = z.infer<typeof TablePropsSchema>;
export type TableColumn = z.infer<typeof TableColumnSchema>;
export type DividerProps = z.infer<typeof DividerPropsSchema>;
export type RepeaterProps = z.infer<typeof RepeaterPropsSchema>;
export type DataBinding = z.infer<typeof DataBindingSchema>;
export type Condition = z.infer<typeof ConditionSchema>;

// Template completo v2
export const TemplateV2Schema = z.object({
  version: z.literal('v2'),
  name: z.string(),
  root: ElementSchema,
});

export type TemplateV2 = z.infer<typeof TemplateV2Schema>;
