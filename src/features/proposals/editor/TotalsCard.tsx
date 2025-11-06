import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

  const calculateTotals = () => {
    const subtotal = sections
      .filter((s) => !s.excludeFromPayment)
      .reduce((sum, s) => sum + s.subtotal, 0);

    return {
      subtotal,
      total: subtotal,
    };
  };

  const totals = calculateTotals();

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Totais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sections.map((section, idx) => (
          <div key={section.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{section.name}:</span>
            <span className="font-medium">{formatCurrency(section.subtotal)}</span>
          </div>
        ))}

        <Separator />

        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold">Total:</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(totals.total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
