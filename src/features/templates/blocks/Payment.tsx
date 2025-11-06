import { RenderContext } from '../engine/schema';
import { formatCurrency } from '../engine/variables';

export function Payment({ context }: { context: RenderContext }) {
  const { data } = context;

  if (!data.payments || data.payments.length === 0) {
    return null;
  }

  return (
    <div className="template-block print-avoid-break">
      <h2 className="text-2xl font-bold text-foreground mb-4">Condições de Pagamento</h2>

      <div className="space-y-4">
        {data.payments.map((payment, idx) => (
          <div key={idx} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{payment.label}</h3>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(payment.amount)}
              </span>
            </div>
            {payment.details && (
              <p className="text-sm text-muted-foreground">{payment.details}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
