import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Plus, Calendar, FileText } from 'lucide-react';
import { ProposalEditorForm } from './proposal-editor-schema';
import { useState } from 'react';

interface Props {
  form: UseFormReturn<ProposalEditorForm>;
}

export function ProposalHeaderForm({ form }: Props) {
  const { profile } = useProfile();
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', profile!.organization_id)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const selectedClient = clients.find((c) => c.id === form.watch('clientId'));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Informações da Proposta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <div className="flex gap-2">
              <Select
                value={form.watch('clientId')}
                onValueChange={(value) => form.setValue('clientId', value, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowNewClientDialog(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {form.formState.errors.clientId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.clientId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Título da Proposta *</Label>
            <Input
              {...form.register('title')}
              placeholder="Ex: Automação Residencial Completa"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
        </div>

        {/* Client Info (quando selecionado) */}
        {selectedClient && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium">Informações do Cliente</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nome:</span>{' '}
                <span className="font-medium">{selectedClient.name}</span>
              </div>
              {selectedClient.email && (
                <div>
                  <span className="text-muted-foreground">Email:</span>{' '}
                  <span className="font-medium">{selectedClient.email}</span>
                </div>
              )}
              {selectedClient.phone && (
                <div>
                  <span className="text-muted-foreground">Telefone:</span>{' '}
                  <span className="font-medium">{selectedClient.phone}</span>
                </div>
              )}
              {selectedClient.address && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Endereço:</span>{' '}
                  <span className="font-medium">{selectedClient.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Datas e Código */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data da Proposta
            </Label>
            <Input type="date" {...form.register('issueDate')} />
          </div>

          <div className="space-y-2">
            <Label>Validade (dias úteis) *</Label>
            <Input
              type="number"
              min={1}
              {...form.register('validityDays', { valueAsNumber: true })}
            />
            {form.formState.errors.validityDays && (
              <p className="text-sm text-destructive">
                {form.formState.errors.validityDays.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Código/Pedido</Label>
            <Input
              {...form.register('code')}
              placeholder="Gerado automaticamente"
              disabled
              className="bg-muted"
            />
          </div>
        </div>

        {/* Atendido por */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Atendido por:</span> {profile?.name}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
