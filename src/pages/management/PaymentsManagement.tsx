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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Loader2, CreditCard } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';

interface CardBrandFee {
  installment: number;
  fee: number;
}

interface CardBrandConfig {
  debit_fee: number;
  credit_max_installments: number;
  credit_interest_free: number;
  credit_fees: CardBrandFee[];
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string | null;
  provider_type: string;
  provider_name: string | null;
  card_brands_config: any;
  is_active: boolean;
  created_at: string;
}

const CARD_BRANDS = ['visa', 'mastercard', 'elo'] as const;

export default function PaymentsManagement() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    provider_type: 'maquininha' as 'maquininha' | 'link_pagamento' | 'pix' | 'boleto' | 'other',
    provider_name: '',
    is_active: true,
    card_brands_config: {
      visa: { debit_fee: 0, credit_max_installments: 12, credit_interest_free: 0, credit_fees: [] as CardBrandFee[] },
      mastercard: { debit_fee: 0, credit_max_installments: 12, credit_interest_free: 0, credit_fees: [] as CardBrandFee[] },
      elo: { debit_fee: 0, credit_max_installments: 12, credit_interest_free: 0, credit_fees: [] as CardBrandFee[] },
    }
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
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('payment_methods')
        .insert([{ ...data, organization_id: profile?.organization_id }]);
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
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('payment_methods')
        .update(data as any)
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
    const brandsConfig = method.card_brands_config || {};
    setFormData({
      name: method.name,
      description: method.description || '',
      provider_type: (method.provider_type as any) || 'other',
      provider_name: method.provider_name || '',
      is_active: method.is_active,
      card_brands_config: {
        visa: brandsConfig.visa || { debit_fee: 0, credit_max_installments: 12, credit_interest_free: 0, credit_fees: [] },
        mastercard: brandsConfig.mastercard || { debit_fee: 0, credit_max_installments: 12, credit_interest_free: 0, credit_fees: [] },
        elo: brandsConfig.elo || { debit_fee: 0, credit_max_installments: 12, credit_interest_free: 0, credit_fees: [] },
      }
    });
    setDialogOpen(true);
  };

  const handleNewMethod = () => {
    setEditingMethod(null);
    setFormData({ 
      name: '', 
      description: '', 
      provider_type: 'maquininha',
      provider_name: '',
      is_active: true,
      card_brands_config: {
        visa: { debit_fee: 0, credit_max_installments: 12, credit_interest_free: 0, credit_fees: [] },
        mastercard: { debit_fee: 0, credit_max_installments: 12, credit_interest_free: 0, credit_fees: [] },
        elo: { debit_fee: 0, credit_max_installments: 12, credit_interest_free: 0, credit_fees: [] },
      }
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMethod(null);
  };

  const updateBrandFee = (brand: keyof typeof formData.card_brands_config, installment: number, fee: number) => {
    const brandConfig = { ...formData.card_brands_config[brand] };
    const fees = [...(brandConfig.credit_fees || [])];
    const index = fees.findIndex(f => f.installment === installment);
    
    if (index >= 0) {
      fees[index] = { installment, fee };
    } else {
      fees.push({ installment, fee });
    }
    
    brandConfig.credit_fees = fees.sort((a, b) => a.installment - b.installment);
    
    setFormData({
      ...formData,
      card_brands_config: {
        ...formData.card_brands_config,
        [brand]: brandConfig
      }
    });
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
              Gerencie maquininhas, links de pagamento e taxas por bandeira
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewMethod}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Forma
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {editingMethod ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
                </DialogTitle>
                <DialogDescription>
                  Configure maquininha, bandeiras e taxas de pagamento
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome/Identificação *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Stone Principal, PagSeguro Link"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider_type">Tipo</Label>
                    <select
                      id="provider_type"
                      value={formData.provider_type}
                      onChange={(e) => setFormData({ ...formData, provider_type: e.target.value as any })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="maquininha">Maquininha/Adquirente</option>
                      <option value="link_pagamento">Link de Pagamento</option>
                      <option value="pix">PIX</option>
                      <option value="boleto">Boleto</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                </div>

                {(formData.provider_type === 'maquininha' || formData.provider_type === 'link_pagamento') && (
                  <div className="space-y-2">
                    <Label htmlFor="provider_name">Nome do Provedor</Label>
                    <Input
                      id="provider_name"
                      value={formData.provider_name}
                      onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                      placeholder="Ex: Stone, PagSeguro, Mercado Pago, Cielo"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Informações adicionais"
                    rows={2}
                  />
                </div>

                {formData.provider_type === 'maquininha' && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Configuração por Bandeira</h3>
                    
                    <Tabs defaultValue="visa">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="visa">Visa</TabsTrigger>
                        <TabsTrigger value="mastercard">Mastercard</TabsTrigger>
                        <TabsTrigger value="elo">Elo</TabsTrigger>
                      </TabsList>
                      
                      {CARD_BRANDS.map(brand => (
                        <TabsContent key={brand} value={brand} className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Taxa Débito (%)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.card_brands_config[brand].debit_fee}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  card_brands_config: {
                                    ...formData.card_brands_config,
                                    [brand]: {
                                      ...formData.card_brands_config[brand],
                                      debit_fee: parseFloat(e.target.value) || 0
                                    }
                                  }
                                })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Máx Parcelas Crédito</Label>
                              <Input
                                type="number"
                                min="1"
                                max="24"
                                value={formData.card_brands_config[brand].credit_max_installments}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  card_brands_config: {
                                    ...formData.card_brands_config,
                                    [brand]: {
                                      ...formData.card_brands_config[brand],
                                      credit_max_installments: parseInt(e.target.value) || 1
                                    }
                                  }
                                })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Parcelas Sem Juros</Label>
                              <Input
                                type="number"
                                min="0"
                                max={formData.card_brands_config[brand].credit_max_installments}
                                value={formData.card_brands_config[brand].credit_interest_free}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  card_brands_config: {
                                    ...formData.card_brands_config,
                                    [brand]: {
                                      ...formData.card_brands_config[brand],
                                      credit_interest_free: parseInt(e.target.value) || 0
                                    }
                                  }
                                })}
                              />
                            </div>
                          </div>

                          {formData.card_brands_config[brand].credit_max_installments > 1 && (
                            <div className="space-y-3">
                              <Label>Taxas por Parcela (Crédito %)</Label>
                              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border rounded">
                                {Array.from({ length: formData.card_brands_config[brand].credit_max_installments }, (_, i) => i + 1).map((installment) => {
                                  const currentFee = formData.card_brands_config[brand].credit_fees?.find((f: CardBrandFee) => f.installment === installment);
                                  return (
                                    <div key={installment} className="flex items-center gap-2">
                                      <Label className="text-xs w-12">{installment}x:</Label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="%"
                                        className="h-8"
                                        value={currentFee?.fee || ''}
                                        onChange={(e) => updateBrandFee(brand, installment, parseFloat(e.target.value) || 0)}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                )}

                {formData.provider_type === 'link_pagamento' && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Configuração de Crédito (Taxa Única)</h3>
                    <p className="text-sm text-muted-foreground">
                      Link de pagamento não diferencia bandeiras. Configure uma taxa única para todas as bandeiras.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Máx Parcelas Crédito</Label>
                        <Input
                          type="number"
                          min="1"
                          max="24"
                          value={formData.card_brands_config.visa.credit_max_installments}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            setFormData({
                              ...formData,
                              card_brands_config: {
                                visa: { ...formData.card_brands_config.visa, credit_max_installments: value, debit_fee: 0 },
                                mastercard: { ...formData.card_brands_config.mastercard, credit_max_installments: value, debit_fee: 0 },
                                elo: { ...formData.card_brands_config.elo, credit_max_installments: value, debit_fee: 0 },
                              }
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Parcelas Sem Juros</Label>
                        <Input
                          type="number"
                          min="0"
                          max={formData.card_brands_config.visa.credit_max_installments}
                          value={formData.card_brands_config.visa.credit_interest_free}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setFormData({
                              ...formData,
                              card_brands_config: {
                                visa: { ...formData.card_brands_config.visa, credit_interest_free: value },
                                mastercard: { ...formData.card_brands_config.mastercard, credit_interest_free: value },
                                elo: { ...formData.card_brands_config.elo, credit_interest_free: value },
                              }
                            });
                          }}
                        />
                      </div>
                    </div>

                    {formData.card_brands_config.visa.credit_max_installments > 1 && (
                      <div className="space-y-3">
                        <Label>Taxas por Parcela (Crédito %)</Label>
                        <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border rounded">
                          {Array.from({ length: formData.card_brands_config.visa.credit_max_installments }, (_, i) => i + 1).map((installment) => {
                            const currentFee = formData.card_brands_config.visa.credit_fees?.find((f: CardBrandFee) => f.installment === installment);
                            return (
                              <div key={installment} className="flex items-center gap-2">
                                <Label className="text-xs w-12">{installment}x:</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="%"
                                  className="h-8"
                                  value={currentFee?.fee || ''}
                                  onChange={(e) => {
                                    const fee = parseFloat(e.target.value) || 0;
                                    CARD_BRANDS.forEach(brand => {
                                      updateBrandFee(brand, installment, fee);
                                    });
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
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
                  <TableHead>Provedor</TableHead>
                  <TableHead>Bandeiras</TableHead>
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
                        {method.provider_type?.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{method.provider_name || '-'}</span>
                    </TableCell>
                    <TableCell>
                      {method.card_brands_config && Object.keys(method.card_brands_config).length > 0 ? (
                        <div className="flex gap-1">
                          {Object.keys(method.card_brands_config).map(brand => (
                            <span key={brand} className="text-xs px-2 py-1 bg-primary/10 rounded capitalize">
                              {brand}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
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
