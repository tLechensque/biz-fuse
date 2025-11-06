import { z } from 'zod';

// ===== Design Tokens System =====
// Tokens globais e customizáveis por template/tenant

export const ColorTokenSchema = z.object({
  primary: z.string().default('220 90% 50%'), // HSL sem hsl()
  accent: z.string().default('280 70% 55%'),
  background: z.string().default('0 0% 100%'),
  foreground: z.string().default('0 0% 10%'),
  muted: z.string().default('220 13% 91%'),
  'muted-foreground': z.string().default('220 9% 46%'),
  border: z.string().default('220 13% 91%'),
  success: z.string().default('142 76% 36%'),
  warning: z.string().default('38 92% 50%'),
  error: z.string().default('0 84% 60%'),
});

export const TypographyTokenSchema = z.object({
  // Font families
  'font-sans': z.string().default('Inter, system-ui, sans-serif'),
  'font-serif': z.string().default('Georgia, serif'),
  'font-mono': z.string().default('Consolas, monospace'),
  
  // Font sizes (rem)
  'text-xs': z.string().default('0.75rem'),    // 12px
  'text-sm': z.string().default('0.875rem'),   // 14px
  'text-base': z.string().default('1rem'),     // 16px
  'text-lg': z.string().default('1.125rem'),   // 18px
  'text-xl': z.string().default('1.25rem'),    // 20px
  'text-2xl': z.string().default('1.5rem'),    // 24px
  'text-3xl': z.string().default('1.875rem'),  // 30px
  'text-4xl': z.string().default('2.25rem'),   // 36px
  
  // Line heights
  'leading-none': z.string().default('1'),
  'leading-tight': z.string().default('1.25'),
  'leading-normal': z.string().default('1.5'),
  'leading-relaxed': z.string().default('1.75'),
  'leading-loose': z.string().default('2'),
  
  // Font weights
  'font-light': z.string().default('300'),
  'font-normal': z.string().default('400'),
  'font-medium': z.string().default('500'),
  'font-semibold': z.string().default('600'),
  'font-bold': z.string().default('700'),
});

export const SpacingTokenSchema = z.object({
  '0': z.string().default('0'),
  '1': z.string().default('0.25rem'),   // 4px
  '2': z.string().default('0.5rem'),    // 8px
  '3': z.string().default('0.75rem'),   // 12px
  '4': z.string().default('1rem'),      // 16px
  '5': z.string().default('1.25rem'),   // 20px
  '6': z.string().default('1.5rem'),    // 24px
  '8': z.string().default('2rem'),      // 32px
  '10': z.string().default('2.5rem'),   // 40px
  '12': z.string().default('3rem'),     // 48px
  '16': z.string().default('4rem'),     // 64px
  '20': z.string().default('5rem'),     // 80px
  '24': z.string().default('6rem'),     // 96px
  '32': z.string().default('8rem'),     // 128px
  '40': z.string().default('10rem'),    // 160px
  '48': z.string().default('12rem'),    // 192px
});

export const RadiusTokenSchema = z.object({
  none: z.string().default('0'),
  sm: z.string().default('0.125rem'),   // 2px
  base: z.string().default('0.25rem'),  // 4px
  md: z.string().default('0.375rem'),   // 6px
  lg: z.string().default('0.5rem'),     // 8px
  xl: z.string().default('0.75rem'),    // 12px
  '2xl': z.string().default('1rem'),    // 16px
  '3xl': z.string().default('1.5rem'),  // 24px
  full: z.string().default('9999px'),
});

export const ShadowTokenSchema = z.object({
  none: z.string().default('none'),
  sm: z.string().default('0 1px 2px 0 rgb(0 0 0 / 0.05)'),
  base: z.string().default('0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'),
  md: z.string().default('0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'),
  lg: z.string().default('0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'),
  xl: z.string().default('0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'),
  '2xl': z.string().default('0 25px 50px -12px rgb(0 0 0 / 0.25)'),
  inner: z.string().default('inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'),
});

export const DesignTokensSchema = z.object({
  colors: ColorTokenSchema,
  typography: TypographyTokenSchema,
  spacing: SpacingTokenSchema,
  radius: RadiusTokenSchema,
  shadows: ShadowTokenSchema,
});

export type DesignTokens = z.infer<typeof DesignTokensSchema>;

// Tokens default do sistema
export const DEFAULT_TOKENS: DesignTokens = {
  colors: ColorTokenSchema.parse({}),
  typography: TypographyTokenSchema.parse({}),
  spacing: SpacingTokenSchema.parse({}),
  radius: RadiusTokenSchema.parse({}),
  shadows: ShadowTokenSchema.parse({}),
};

/**
 * Resolve um token (ex: "colors.primary" ou "spacing.4")
 */
export function resolveToken(
  tokens: DesignTokens,
  path: string
): string | undefined {
  const parts = path.split('.');
  let value: any = tokens;
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return undefined;
    }
  }
  
  return typeof value === 'string' ? value : undefined;
}

/**
 * Aplica tokens CSS como variáveis
 */
export function tokensToCSS(tokens: DesignTokens): string {
  const lines: string[] = [':root {'];
  
  // Colors
  Object.entries(tokens.colors).forEach(([key, value]) => {
    lines.push(`  --color-${key}: ${value};`);
  });
  
  // Typography
  Object.entries(tokens.typography).forEach(([key, value]) => {
    lines.push(`  --${key}: ${value};`);
  });
  
  // Spacing
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    lines.push(`  --space-${key}: ${value};`);
  });
  
  // Radius
  Object.entries(tokens.radius).forEach(([key, value]) => {
    lines.push(`  --radius-${key}: ${value};`);
  });
  
  // Shadows
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    lines.push(`  --shadow-${key}: ${value};`);
  });
  
  lines.push('}');
  return lines.join('\n');
}
