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
    
    // Calculate product costs
    const productCosts = filteredSections.reduce((sum, s) => {
      return sum + s.items.reduce((itemSum, item) => {
        return itemSum + (item.costPrice || 0) * item.qty;
      }, 0);
    }, 0);

    // Calculate discounts
    const totalDiscounts = filteredSections.reduce((sum, section) => {
      const sectionDiscounts = section.items.reduce((itemSum, item) => {
        if (item.discountEnabled) {
          const baseValue = item.qty * item.unitPrice;
          if (item.discountType === 'percentage') {
            return itemSum + (baseValue * ((item.discountValue || 0) / 100));
          } else {
            return itemSum + (item.discountValue || 0);
          }
        }
        return itemSum;
      }, 0);
      return sum + sectionDiscounts;
    }, 0);

    // Calculate payment fees
    const paymentFees = Array.isArray(paymentConditions)
      ? paymentConditions.reduce((sum, condition) => sum + (condition.paymentFee || 0), 0)
      : 0;

    // Get taxes and shipping
    const taxesAndShipping = form.watch('taxesAndShipping');
    const shippingCost = taxesAndShipping?.shippingCost || 0;
    const taxAmount = taxesAndShipping?.taxAmount || 0;

    // Total cost including all fees
    const totalCost = productCosts + paymentFees + shippingCost + taxAmount;
    
    // Margin calculation: (Revenue - Cost) / Revenue * 100
    const revenue = subtotal - totalDiscounts;
    const margin = revenue > 0 ? ((revenue - totalCost) / revenue) * 100 : 0;

    return {
      subtotal,
      productCosts,
      totalDiscounts,
      paymentFees,
      shippingCost,
      taxAmount,
      totalCost,
      margin: isNaN(margin) ? 0 : margin,
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
        {/* Section Subtotals */}
        <div className="space-y-2">
          <h4 className="font-medium text-xs text-muted-foreground uppercase">Subtotais por Seção</h4>
          {sections
            .filter((s) => !s.excludeFromPayment)
            .map((section) => (
              <div key={section.id} className="flex justify-between text-sm">
                <span>{section.name}:</span>
                <span className="font-medium">{formatCurrency(section.subtotal)}</span>
              </div>
            ))}
        </div>

        <Separator />

        {/* Costs Breakdown */}
        <div className="space-y-2">
          <h4 className="font-medium text-xs text-muted-foreground uppercase">Custos</h4>
          
          <div className="flex justify-between text-sm">
            <span>Custo dos Produtos:</span>
            <span className="text-destructive">{formatCurrency(totals.productCosts)}</span>
          </div>

          {totals.totalDiscounts > 0 && (
            <div className="flex justify-between text-sm">
              <span>Descontos Aplicados:</span>
              <span className="text-green-600">- {formatCurrency(totals.totalDiscounts)}</span>
            </div>
          )}

          {totals.paymentFees > 0 && (
            <div className="flex justify-between text-sm">
              <span>Taxas de Pagamento:</span>
              <span className="text-destructive">{formatCurrency(totals.paymentFees)}</span>
            </div>
          )}

          {totals.shippingCost > 0 && (
            <div className="flex justify-between text-sm">
              <span>Frete:</span>
              <span className="text-destructive">{formatCurrency(totals.shippingCost)}</span>
            </div>
          )}

          {totals.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span>Impostos:</span>
              <span className="text-destructive">{formatCurrency(totals.taxAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-semibold pt-2 border-t">
            <span>Custo Total:</span>
            <span className="text-destructive">{formatCurrency(totals.totalCost)}</span>
          </div>
        </div>

        <Separator />

        {/* Subtotal */}
        <div className="flex justify-between">
          <span className="font-medium">Subtotal:</span>
          <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
        </div>

        <Separator />

        {/* Final Total */}
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">Total:</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(totals.total)}
          </span>
        </div>

        {/* Margin */}
        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Margem de Lucro:</span>
            <span
              className={`font-bold ${
                totals.margin > 20 ? 'text-green-600' : totals.margin > 10 ? 'text-yellow-600' : 'text-red-600'
              }`}
            >
              {totals.margin.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Lucro: {formatCurrency(totals.total - totals.totalCost)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
