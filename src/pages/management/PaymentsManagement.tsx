import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Loader2, CreditCard } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';

interface PaymentMethod {
  id: string;
  name: string;
  description: string | null;
  type: string;
  is_active: boolean;
  max_installments: number | null;
  interest_free_installments: number | null;
  fee_percentage: number | null;
  fee_per_installment: any;
  allow_down_payment: boolean | null;
  created_at: string;
}

export default function PaymentsManagement() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'other' as 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'other',
    is_active: true,
    max_installments: 1,
    interest_free_installments: 0,
    fee_percentage: 0,
    can_transfer_fee: false,
    allow_down_payment: false,
    fee_per_installment: [] as { installment: number; fee: number }[],
  });

  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ['payment-methods', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('organization_id', profile?.organization_id!)
        .order('name');
      
      if (error) throw error;
      return data as PaymentMethod[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('payment_methods')
        .insert({ ...data, organization_id: profile?.organization_id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast({ title: 'Forma de pagamento criada' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar forma de pagamento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('payment_methods')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast({ title: 'Forma de pagamento atualizada' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast({ title: 'Forma de pagamento excluída' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingMethod) {
      updateMutation.mutate({ id: editingMethod.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      description: method.description || '',
      type: method.type as any,
      is_active: method.is_active,
      max_installments: method.max_installments || 1,
      interest_free_installments: method.interest_free_installments || 0,
      fee_percentage: method.fee_percentage || 0,
      can_transfer_fee: false,
      allow_down_payment: method.allow_down_payment || false,
      fee_per_installment: method.fee_per_installment || [],
    });
    setDialogOpen(true);
  };

  const handleNewMethod = () => {
    setEditingMethod(null);
    setFormData({ 
      name: '', 
      description: '', 
      type: 'other',
      is_active: true,
      max_installments: 1,
      interest_free_installments: 0,
      fee_percentage: 0,
      can_transfer_fee: false,
      allow_down_payment: false,
      fee_per_installment: [],
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMethod(null);
    setFormData({ 
      name: '', 
      description: '', 
      type: 'other',
      is_active: true,
      max_installments: 1,
      interest_free_installments: 0,
      fee_percentage: 0,
      can_transfer_fee: false,
      allow_down_payment: false,
      fee_per_installment: [],
    });
  };

  const updateInstallmentFee = (installment: number, fee: number) => {
    const fees = [...formData.fee_per_installment];
    const index = fees.findIndex(f => f.installment === installment);
    if (index >= 0) {
      fees[index] = { installment, fee };
    } else {
      fees.push({ installment, fee });
    }
    setFormData({ ...formData, fee_per_installment: fees.sort((a, b) => a.installment - b.installment) });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <RoleGuard requireAdmin>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Formas de Pagamento</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie as formas de pagamento disponíveis para propostas
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewMethod}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Forma
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {editingMethod ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
                </DialogTitle>
                <DialogDescription>
                  Configure taxas, parcelamento e condições de pagamento
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: PIX, Cartão de Crédito"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="credit_card">Cartão de Crédito</option>
                      <option value="debit_card">Cartão de Débito</option>
                      <option value="pix">PIX</option>
                      <option value="boleto">Boleto</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalhes sobre a forma de pagamento"
                    rows={2}
                  />
                </div>

                {(formData.type === 'credit_card' || formData.type === 'debit_card') && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Configuração de Taxas</h3>
                    
                    {formData.type === 'debit_card' ? (
                      <div className="space-y-2">
                        <Label htmlFor="fee_percentage">Taxa do Débito (%)</Label>
                        <Input
                          id="fee_percentage"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.fee_percentage}
                          onChange={(e) => setFormData({ ...formData, fee_percentage: parseFloat(e.target.value) || 0 })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Cartão de débito é sempre à vista (1x) com a taxa configurada
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="max_installments">Máximo de Parcelas</Label>
                            <Input
                              id="max_installments"
                              type="number"
                              min="1"
                              max="24"
                              value={formData.max_installments}
                              onChange={(e) => setFormData({ ...formData, max_installments: parseInt(e.target.value) || 1 })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="interest_free">Parcelas Sem Juros</Label>
                            <Input
                              id="interest_free"
                              type="number"
                              min="0"
                              max={formData.max_installments}
                              value={formData.interest_free_installments}
                              onChange={(e) => setFormData({ ...formData, interest_free_installments: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fee_percentage">Taxa Geral (%)</Label>
                            <Input
                              id="fee_percentage"
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.fee_percentage}
                              onChange={(e) => setFormData({ ...formData, fee_percentage: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        </div>

                        {formData.max_installments > 1 && (
                          <div className="space-y-3">
                            <Label>Taxa por Parcela (opcional)</Label>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded">
                              {Array.from({ length: formData.max_installments }, (_, i) => i + 1).map((installment) => {
                                const currentFee = formData.fee_per_installment.find(f => f.installment === installment);
                                return (
                                  <div key={installment} className="flex items-center gap-2">
                                    <Label className="text-xs w-16">{installment}x:</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="% taxa"
                                      className="h-8"
                                      value={currentFee?.fee || ''}
                                      onChange={(e) => updateInstallmentFee(installment, parseFloat(e.target.value) || 0)}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Configure taxas específicas por parcela. Deixe em branco para usar a taxa geral.
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="can_transfer_fee">Permitir Repassar Taxa ao Cliente</Label>
                            <p className="text-xs text-muted-foreground">Cliente pode optar por absorver as taxas</p>
                          </div>
                          <Switch
                            id="can_transfer_fee"
                            checked={formData.can_transfer_fee}
                            onCheckedChange={(checked) => setFormData({ ...formData, can_transfer_fee: checked })}
                          />
                        </div>

                        <div className="flex items-center justify-between border-t pt-3">
                          <div className="space-y-1">
                            <Label htmlFor="allow_down_payment">Permitir Entrada + Parcelamento</Label>
                            <p className="text-xs text-muted-foreground">
                              Cliente pode dar entrada e parcelar o restante no crédito
                            </p>
                          </div>
                          <Switch
                            id="allow_down_payment"
                            checked={formData.allow_down_payment}
                            onCheckedChange={(checked) => setFormData({ ...formData, allow_down_payment: checked })}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Ativo</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingMethod ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formas de Pagamento Cadastradas</CardTitle>
            <CardDescription>
              {paymentMethods.length} forma(s) de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          {method.name}
                        </div>
                        {method.description && (
                          <span className="text-xs text-muted-foreground">{method.description}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs capitalize">
                        {method.type.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {method.type === 'debit_card' ? (
                        <span className="text-xs">À vista (Débito)</span>
                      ) : method.max_installments && method.max_installments > 1 ? (
                        <div className="text-xs">
                          <span>Até {method.max_installments}x</span>
                          {method.interest_free_installments > 0 && (
                            <span className="block text-muted-foreground">
                              {method.interest_free_installments}x sem juros
                            </span>
                          )}
                          {method.allow_down_payment && (
                            <span className="block text-primary">+ Entrada</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">À vista</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {method.fee_percentage > 0 ? (
                        <span className="text-xs">{method.fee_percentage}%</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem taxa</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${method.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {method.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(method)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir forma de pagamento</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir "{method.name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(method.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}