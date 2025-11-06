import React from 'react';

interface TotalsSummaryProps {
  subtotal: number;
  upgradesTotal?: number;
  total: number;
  margin?: number;
  variant?: 'simple' | 'card' | 'highlight';
}

export function TotalsSummary({ 
  subtotal, 
  upgradesTotal = 0, 
  total, 
  margin,
  variant = 'simple' 
}: TotalsSummaryProps) {
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (variant === 'highlight') {
    return (
      <div className="p-6 bg-primary text-primary-foreground rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg">Subtotal</span>
          <span className="text-lg">{formatBRL(subtotal)}</span>
        </div>
        {upgradesTotal > 0 && (
          <div className="flex justify-between items-center mb-4 text-sm opacity-90">
            <span>Upgrades</span>
            <span>{formatBRL(upgradesTotal)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-4 border-t border-primary-foreground/20">
          <span className="text-2xl font-bold">Total</span>
          <span className="text-3xl font-bold">{formatBRL(total)}</span>
        </div>
        {margin && (
          <div className="mt-2 text-sm opacity-75 text-right">
            Margem: {margin.toFixed(1)}%
          </div>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="p-4 bg-muted rounded-lg space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium">{formatBRL(subtotal)}</span>
        </div>
        {upgradesTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span>Upgrades</span>
            <span>{formatBRL(upgradesTotal)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t font-bold text-lg">
          <span>Total</span>
          <span>{formatBRL(total)}</span>
        </div>
      </div>
    );
  }

  // simple
  return (
    <div className="space-y-1 text-right">
      <div className="text-sm">Subtotal: {formatBRL(subtotal)}</div>
      {upgradesTotal > 0 && (
        <div className="text-sm">Upgrades: {formatBRL(upgradesTotal)}</div>
      )}
      <div className="text-xl font-bold">Total: {formatBRL(total)}</div>
    </div>
  );
}
