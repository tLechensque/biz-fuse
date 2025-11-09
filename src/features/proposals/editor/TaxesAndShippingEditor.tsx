import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProposalEditorForm } from './proposal-editor-schema';

interface Props {
  form: UseFormReturn<ProposalEditorForm>;
}

export function TaxesAndShippingEditor({ form }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleTaxPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = Number(e.target.value);
    const taxesAndShipping = form.getValues('taxesAndShipping');
    
    if (taxesAndShipping) {
      form.setValue('taxesAndShipping', {
        ...taxesAndShipping,
        taxPercentage: percentage,
      });
      
      // Recalculate tax amount based on subtotal
      const sections = form.getValues('sections');
      const subtotal = sections
        .filter((s) => !s.excludeFromPayment)
        .reduce((sum, s) => sum + s.subtotal, 0);
      
      const taxAmount = subtotal * (percentage / 100);
      form.setValue('taxesAndShipping', {
        ...taxesAndShipping,
        taxPercentage: percentage,
        taxAmount,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impostos e Frete</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="shipping">Frete (R$)</Label>
            <Input
              id="shipping"
              type="number"
              min={0}
              step={0.01}
              placeholder="0,00"
              value={form.watch('taxesAndShipping')?.shippingCost || 0}
              onChange={(e) => {
                const value = Number(e.target.value);
                const current = form.getValues('taxesAndShipping');
                form.setValue('taxesAndShipping', {
                  ...current,
                  shippingCost: value,
                });
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxPercentage">Impostos (%)</Label>
            <Input
              id="taxPercentage"
              type="number"
              min={0}
              max={100}
              step={0.01}
              placeholder="0"
              value={form.watch('taxesAndShipping')?.taxPercentage || 0}
              onChange={handleTaxPercentageChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxAmount">Valor do Imposto (Calculado)</Label>
          <Input
            id="taxAmount"
            type="text"
            disabled
            value={formatCurrency(form.watch('taxesAndShipping')?.taxAmount || 0)}
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxNotes">Observações</Label>
          <Textarea
            id="taxNotes"
            placeholder="Observações sobre impostos e frete..."
            value={form.watch('taxesAndShipping')?.notes || ''}
            onChange={(e) => {
              const value = e.target.value;
              const current = form.getValues('taxesAndShipping');
              form.setValue('taxesAndShipping', {
                ...current,
                notes: value,
              });
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
