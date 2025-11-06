import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { ProposalEditorForm } from './proposal-editor-schema';

interface Props {
  form: UseFormReturn<ProposalEditorForm>;
}

export function TotalsCard({ form }: Props) {
  const sections = form.watch('sections');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calculate section totals
  const sectionTotals = sections.map((section) => ({
    name: section.name,
    subtotal: section.subtotal,
    excluded: section.excludeFromPayment,
  }));

  // Calculate upgrades total
  const upgradesTotal = sections
    .flatMap((s) => s.upgrades)
    .reduce((sum, u) => sum + u.upgradeValue, 0);

  // Calculate subtotal (excluding sections marked as excluded)
  const subtotal = sections
    .filter((s) => !s.excludeFromPayment)
    .reduce((sum, s) => sum + s.subtotal, 0);

  // Grand total
  const total = subtotal + upgradesTotal;

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Totais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Section breakdown */}
        <div className="space-y-2">
          {sectionTotals.map((section, index) => (
            <div
              key={index}
              className={`flex items-center justify-between text-sm ${
                section.excluded ? 'text-muted-foreground' : ''
              }`}
            >
              <span className="flex items-center gap-2">
                {section.name}
                {section.excluded && (
                  <span className="text-xs text-orange-500">(excluído)</span>
                )}
              </span>
              <span className="font-medium">{formatCurrency(section.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="h-px bg-border" />

        {/* Subtotal */}
        <div className="flex items-center justify-between font-semibold">
          <span>Subtotal (incluso no pagamento)</span>
          <span className="text-lg">{formatCurrency(subtotal)}</span>
        </div>

        {/* Upgrades */}
        {upgradesTotal > 0 && (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Upgrades</span>
              <span className="font-medium">+ {formatCurrency(upgradesTotal)}</span>
            </div>
          </>
        )}

        <div className="h-px bg-border" />

        {/* Total */}
        <div className="flex items-center justify-between font-bold text-lg">
          <span>Total Geral</span>
          <span className="text-primary">{formatCurrency(total)}</span>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground">
          * Seções marcadas como "excluídas do pagamento" não entram no cálculo das formas de
          pagamento
        </p>
      </CardContent>
    </Card>
  );
}
