import React from 'react';
import { Element } from '../runtime/props-schema';
import { ProposalView } from '@/features/templates/engine/schema';
import { DesignTokens } from '../runtime/design-tokens';
import { resolveBinding } from '../runtime/databind';

interface ItemCardProps {
  variant?: 'compact' | 'visual' | 'tabular';
  item: any;
  data: ProposalView;
  tokens: DesignTokens;
}

export function ItemCard({ variant = 'compact', item, data, tokens }: ItemCardProps) {
  const productName = item.product?.name || '';
  const brandName = item.brand?.name || '';
  const qty = item.qty || 0;
  const unitPrice = item.unitPrice || 0;
  const subtotal = item.subtotal || 0;
  const imageUrl = item.imageUrl;

  if (variant === 'visual') {
    return (
      <div className="flex gap-4 p-4 border rounded-lg bg-white">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={productName}
            className="w-24 h-24 object-cover rounded"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{productName}</h3>
          {brandName && <p className="text-sm text-muted-foreground">{brandName}</p>}
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm">Qtd: {qty}</span>
            <span className="font-semibold text-lg">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'tabular') {
    return (
      <tr>
        <td className="px-4 py-2">{productName}</td>
        {brandName && <td className="px-4 py-2">{brandName}</td>}
        <td className="px-4 py-2 text-center">{qty}</td>
        <td className="px-4 py-2 text-right">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(unitPrice)}
        </td>
        <td className="px-4 py-2 text-right font-semibold">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
        </td>
      </tr>
    );
  }

  // compact
  return (
    <div className="flex justify-between items-center p-3 border-b">
      <div>
        <span className="font-medium">{productName}</span>
        {brandName && <span className="text-sm text-muted-foreground ml-2">({brandName})</span>}
        <span className="text-sm text-muted-foreground ml-2">× {qty}</span>
      </div>
      <span className="font-semibold">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
      </span>
    </div>
  );
}
