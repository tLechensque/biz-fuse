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
  const paymentConditions = form.watch('paymentConditions');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateTotals = () => {
    const filteredSections = sections.filter((s) => !s.excludeFromPayment);
    
    const subtotal = filteredSections.reduce((sum, s) => sum + s.subtotal, 0);
    
    const cost = filteredSections.reduce((sum, s) => {
      return sum + s.items.reduce((itemSum, item) => {
        return itemSum + (item.costPrice || 0) * item.qty;
      }, 0);
    }, 0);

    const marginBaseTotal = subtotal;

    // considerar taxa do meio de pagamento (primeira condição)
    const paymentFee = Array.isArray(paymentConditions) && paymentConditions.length > 0
      ? (paymentConditions[0]?.paymentFee || 0)
      : 0;

    const costWithFees = cost + paymentFee;
    const margin = marginBaseTotal > 0 ? ((marginBaseTotal - costWithFees) / marginBaseTotal) * 100 : 0;

    return {
      subtotal,
      cost: costWithFees,
      margin,
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

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Custo Total + Taxas:</span>
          <span className="font-medium">{formatCurrency(totals.cost)}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
        </div>

        <Separator />

        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold">Total:</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(totals.total)}
          </span>
        </div>

        <div className="text-sm text-muted-foreground text-right">
          Margem: <span className={totals.margin > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {totals.margin.toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
