import { RenderContext } from '../engine/schema';
import { formatCurrency } from '../engine/variables';

export function Totals({ context }: { context: RenderContext }) {
  const { data } = context;
  const { totals } = data;

  return (
    <div className="template-block print-avoid-break">
      <div className="bg-muted/30 rounded-lg p-6 space-y-3 max-w-md ml-auto">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Subtotal dos Itens:</span>
          <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
        </div>

        {totals.upgradesTotal > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Upgrades Selecionados:</span>
            <span className="font-medium text-primary">
              + {formatCurrency(totals.upgradesTotal)}
            </span>
          </div>
        )}

        <div className="border-t border-border pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Total:</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(totals.total)}
            </span>
          </div>
        </div>

        {totals.margin !== undefined && (
          <div className="text-xs text-muted-foreground text-right">
            Margem: {totals.margin.toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}
