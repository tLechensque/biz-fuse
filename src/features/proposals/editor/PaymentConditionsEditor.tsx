import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { ProposalEditorForm } from './proposal-editor-schema';
import { useEffect } from 'react';

interface Props {
  form: UseFormReturn<ProposalEditorForm>;
}

export function PaymentConditionsEditor({ form }: Props) {
  const { profile } = useProfile();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'paymentConditions',
  });

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('organization_id', profile!.organization_id)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateTotal = () => {
    const sections = form.getValues('sections');
    return sections
      .filter((s) => !s.excludeFromPayment)
      .reduce((sum, s) => sum + s.subtotal, 0);
  };

  const handleAdd = () => {
    const total = calculateTotal();
    append({
      id: crypto.randomUUID(),
      methodId: '',
      methodName: '',
      installments: 1,
      installmentValue: total,
      totalValue: total,
      details: '',
    });
  };

  const handleMethodChange = (index: number, methodId: string) => {
    const method = paymentMethods.find((m) => m.id === methodId);
    const total = calculateTotal();
    
    if (method) {
      form.setValue(`paymentConditions.${index}.methodId`, methodId);
      form.setValue(`paymentConditions.${index}.methodName`, method.name);
      
      // Use provider_type (more specific) instead of type
      const paymentType = method.provider_type || method.type || 'other';
      form.setValue(`paymentConditions.${index}.paymentType`, paymentType);
      form.setValue(`paymentConditions.${index}.brand`, '');
      
      // Reset parcels - check if it's a card/maquininha type
      const supportsInstallments = paymentType === 'card' || paymentType === 'maquininha' || paymentType === 'financing';
      const max = method.max_installments || 1;
      const installments = supportsInstallments && max > 1 ? 1 : 1;
      form.setValue(`paymentConditions.${index}.installments`, installments);
      form.setValue(`paymentConditions.${index}.installmentValue`, total / installments);
      form.setValue(`paymentConditions.${index}.totalValue`, total);
      form.setValue(`paymentConditions.${index}.paymentFee`, 0);
    }
  };

  const handleInstallmentsChange = (index: number, installments: number) => {
    const total = calculateTotal();
    const method = paymentMethods.find(
      (m) => m.id === form.getValues(`paymentConditions.${index}.methodId`)
    );

    if (method && installments > 0) {
      form.setValue(`paymentConditions.${index}.installments`, installments);
      const installmentValue = total / installments;
      form.setValue(`paymentConditions.${index}.installmentValue`, installmentValue);
      form.setValue(`paymentConditions.${index}.totalValue`, total);

      // calcular taxa aproximada
      const fee = computePaymentFee(total, installments, method, form.getValues(`paymentConditions.${index}.brand`));
      form.setValue(`paymentConditions.${index}.paymentFee`, fee);
    }
  };

  // Recalculate when sections change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('sections')) {
        const total = calculateTotal();
        const conditions = form.getValues('paymentConditions');
        conditions.forEach((_, index) => {
          const installments = form.getValues(`paymentConditions.${index}.installments`) || 1;
          form.setValue(`paymentConditions.${index}.totalValue`, total);
          form.setValue(`paymentConditions.${index}.installmentValue`, total / installments);
          const method = paymentMethods.find((m) => m.id === form.getValues(`paymentConditions.${index}.methodId`));
          const brand = form.getValues(`paymentConditions.${index}.brand`);
          const fee = method ? computePaymentFee(total, installments, method, brand) : 0;
          form.setValue(`paymentConditions.${index}.paymentFee`, fee);
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, paymentMethods]);

  // Helper para calcular taxa aproximada do meio de pagamento
  function computePaymentFee(total: number, installments: number, method: any, brand?: string) {
    if (!method || total <= 0) return 0;
    const t = (method.type || '').toLowerCase();
    if (t === 'pix' || method.name?.toLowerCase().includes('pix')) return 0;

    // Se houver configuração por parcela
    const feePerInst = (method as any).fee_per_installment;
    if (Array.isArray(feePerInst)) {
      const found = feePerInst.find((f: any) => {
        const k = Number(f.installments ?? f.parcels ?? f.n ?? 0);
        return k === Number(installments);
      });
      const perc = Number(found?.percentage ?? found?.fee ?? 0);
      return (total * perc) / 100;
    }

    // Fallback para taxa percentual padrão
    const perc = Number((method as any).fee_percentage || 0);
    return (total * perc) / 100;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Condições de Pagamento
          </CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Condição
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-8 border rounded-lg border-dashed">
            <p className="text-muted-foreground mb-4">
              Nenhuma condição de pagamento adicionada
            </p>
            <Button type="button" variant="outline" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Condição
            </Button>
          </div>
        ) : (
          fields.map((field, index) => {
            const condition = form.watch(`paymentConditions.${index}`);
            const method = paymentMethods.find((m) => m.id === condition?.methodId);
            const availableBrands = method?.card_brands_config ? Object.keys(method.card_brands_config as any) : [];
            
            // Determinar se o método aceita parcelamento
            const paymentType = method?.provider_type || method?.type || 'other';
            const supportsInstallments = method && 
              (paymentType === 'card' || paymentType === 'maquininha' || paymentType === 'financing') &&
              (method.max_installments || 1) > 1;
            
            // Get max installments (considerando marca escolhida)
            let maxInstallments = 1;
            if (method?.card_brands_config && condition?.brand) {
              const config = method.card_brands_config as any;
              const brandCfg = config[condition.brand];
              if (brandCfg?.credit_max_installments) {
                maxInstallments = brandCfg.credit_max_installments;
              }
            } else if (method?.max_installments) {
              maxInstallments = method.max_installments;
            }

            return (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">Opção {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Forma de Pagamento *</Label>
                    <Select
                      value={condition?.methodId || ''}
                      onValueChange={(value) => handleMethodChange(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {availableBrands.length > 0 && (
                    <div className="space-y-2">
                      <Label>Bandeira do Cartão *</Label>
                      <Select
                        value={condition?.brand || ''}
                        onValueChange={(value) => {
                          form.setValue(`paymentConditions.${index}.brand`, value);
                          handleInstallmentsChange(index, 1);
                        }}
                        disabled={!condition?.methodId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a bandeira" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableBrands.map((b) => (
                            <SelectItem key={b} value={b}>{b.toUpperCase()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {supportsInstallments ? (
                    <div className="space-y-2">
                      <Label>Número de Parcelas *</Label>
                      <Select
                        value={String(condition?.installments || 1)}
                        onValueChange={(value) => handleInstallmentsChange(index, Number(value))}
                        disabled={!condition?.methodId || (availableBrands.length > 0 && !condition?.brand)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={String(num)}>
                              {num}x
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Tipo de Pagamento</Label>
                      <div className="p-2 bg-muted rounded text-sm">
                        À vista
                      </div>
                    </div>
                  )}
                </div>

                {condition?.methodId && (
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    {supportsInstallments ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Valor da Parcela:</span>
                          <span className="font-semibold">{formatCurrency(condition.installmentValue || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-bold text-primary">{formatCurrency(condition.totalValue || 0)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {condition.installments}x de {formatCurrency(condition.installmentValue || 0)} = {formatCurrency(condition.totalValue || 0)}
                        </p>
                      </>
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total à vista:</span>
                        <span className="font-bold text-primary">{formatCurrency(condition.totalValue || 0)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
