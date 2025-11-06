import { RenderContext } from '../engine/schema';
import { formatCurrency } from '../engine/variables';
import { CheckCircle, Circle } from 'lucide-react';

export function Upgrades({ context }: { context: RenderContext }) {
  const { data } = context;

  if (!data.upgrades || data.upgrades.length === 0) {
    return null;
  }

  return (
    <div className="template-block print-avoid-break">
      <h2 className="text-2xl font-bold text-foreground mb-4">Opções de Upgrade</h2>

      <div className="space-y-3">
        {data.upgrades.map((upgrade, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              upgrade.selected
                ? 'border-primary bg-primary/5'
                : 'border-border bg-background'
            }`}
          >
            <div className="flex items-center gap-3">
              {upgrade.selected ? (
                <CheckCircle className="w-5 h-5 text-primary" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
              <span className={upgrade.selected ? 'font-medium' : ''}>
                {upgrade.name}
              </span>
            </div>
            <span
              className={`font-semibold ${
                upgrade.selected ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              + {formatCurrency(upgrade.delta)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
