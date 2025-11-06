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
      
      // Reset installments to 1 when changing method
      form.setValue(`paymentConditions.${index}.installments`, 1);
      form.setValue(`paymentConditions.${index}.installmentValue`, total);
      form.setValue(`paymentConditions.${index}.totalValue`, total);
    }
  };

  const handleInstallmentsChange = (index: number, installments: number) => {
    const total = calculateTotal();
    const method = paymentMethods.find(
      (m) => m.id === form.getValues(`paymentConditions.${index}.methodId`)
    );

    if (method && installments > 0) {
      form.setValue(`paymentConditions.${index}.installments`, installments);
      
      // Calculate installment value
      const installmentValue = total / installments;
      form.setValue(`paymentConditions.${index}.installmentValue`, installmentValue);
      form.setValue(`paymentConditions.${index}.totalValue`, total);
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
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
            
            // Get max installments from card_brands_config or fallback to max_installments
            let maxInstallments = 12; // default
            if (method?.card_brands_config) {
              const config = method.card_brands_config as any;
              const visaConfig = config.visa || config.mastercard || config.elo;
              if (visaConfig?.credit_max_installments) {
                maxInstallments = visaConfig.credit_max_installments;
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

                  {maxInstallments > 1 ? (
                    <div className="space-y-2">
                      <Label>Número de Parcelas *</Label>
                      <Select
                        value={String(condition?.installments || 1)}
                        onValueChange={(value) => handleInstallmentsChange(index, Number(value))}
                        disabled={!condition?.methodId}
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
                    {maxInstallments > 1 ? (
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
