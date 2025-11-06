import React from 'react';
import { ProposalView } from '@/features/templates/engine/schema';
import { DesignTokens } from '../runtime/design-tokens';

interface GroupSectionProps {
  title: string;
  items: any[];
  data: ProposalView;
  tokens: DesignTokens;
  variant?: 'simple' | 'card' | 'cover';
  children?: React.ReactNode;
}

export function GroupSection({ 
  title, 
  items, 
  data, 
  tokens,
  variant = 'simple',
  children 
}: GroupSectionProps) {
  if (variant === 'cover') {
    return (
      <div className="min-h-[200mm] flex flex-col justify-center items-center p-8 bg-gradient-to-br from-primary/10 to-accent/10">
        <h2 className="text-4xl font-bold mb-4">{title}</h2>
        <p className="text-xl text-muted-foreground mb-8">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </p>
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="p-6 bg-card border rounded-lg">
        <h2 className="text-2xl font-bold mb-4 pb-2 border-b">{title}</h2>
        <div className="space-y-2">
          {children}
        </div>
      </div>
    );
  }

  // simple
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div>
        {children}
      </div>
    </div>
  );
}
