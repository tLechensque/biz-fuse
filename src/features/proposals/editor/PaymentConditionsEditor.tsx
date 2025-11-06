import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { ProposalEditorForm } from './proposal-editor-schema';

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

  const handleAdd = () => {
    append({
      id: crypto.randomUUID(),
      label: '',
      amount: 0,
      details: '',
    });
  };

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
          fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-start justify-between">
                <h4 className="font-medium">Condição {index + 1}</h4>
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
                  <Label>Label *</Label>
                  <Input
                    {...form.register(`paymentConditions.${index}.label`)}
                    placeholder="Ex: 12x sem juros"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Valor *</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    {...form.register(`paymentConditions.${index}.amount`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Forma de Pagamento (opcional)</Label>
                <Select
                  value={form.watch(`paymentConditions.${index}.methodId`) || ''}
                  onValueChange={(value) => {
                    const method = paymentMethods.find((m) => m.id === value);
                    form.setValue(`paymentConditions.${index}.methodId`, value, {
                      shouldDirty: true,
                    });
                    if (method) {
                      form.setValue(`paymentConditions.${index}.methodName`, method.name, {
                        shouldDirty: true,
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione (opcional)" />
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

              <div className="space-y-2">
                <Label>Detalhes/Observações (opcional)</Label>
                <Textarea
                  {...form.register(`paymentConditions.${index}.details`)}
                  placeholder="Ex: Entrada de 30%, restante em 12x..."
                  rows={2}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
