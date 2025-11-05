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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, Percent, Calendar } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';

interface Discount {
  id: string;
  name: string;
  description: string | null;
  discount_percentage: number;
  discount_amount: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  product_ids: string[];
  brand_ids: string[];
  category_ids: string[];
  supplier_id: string | null;
  created_at: string;
}

export default function DiscountsManagement() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_percentage: 0,
    discount_amount: null as number | null,
    start_date: '',
    end_date: '',
    is_active: true,
    target_type: 'product' as 'product' | 'brand' | 'category' | 'supplier',
    target_ids: [] as string[],
    supplier_id: null as string | null,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ['discounts', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_discounts')
        .select('*')
        .eq('organization_id', profile?.organization_id!)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as Discount[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload: any = {
        name: data.name,
        description: data.description || null,
        discount_percentage: data.discount_percentage,
        discount_amount: data.discount_amount,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: data.is_active,
        organization_id: profile?.organization_id,
        product_ids: [],
        brand_ids: [],
        category_ids: [],
        supplier_id: null,
      };

      if (data.target_type === 'product') {
        payload.product_ids = data.target_ids;
      } else if (data.target_type === 'brand') {
        payload.brand_ids = data.target_ids;
      } else if (data.target_type === 'category') {
        payload.category_ids = data.target_ids;
      } else if (data.target_type === 'supplier') {
        payload.supplier_id = data.supplier_id;
      }

      const { error } = await supabase
        .from('product_discounts')
        .insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast({ title: 'Desconto criado com sucesso' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar desconto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const payload: any = {
        name: data.name,
        description: data.description || null,
        discount_percentage: data.discount_percentage,
        discount_amount: data.discount_amount,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: data.is_active,
        product_ids: [],
        brand_ids: [],
        category_ids: [],
        supplier_id: null,
      };

      if (data.target_type === 'product') {
        payload.product_ids = data.target_ids;
      } else if (data.target_type === 'brand') {
        payload.brand_ids = data.target_ids;
      } else if (data.target_type === 'category') {
        payload.category_ids = data.target_ids;
      } else if (data.target_type === 'supplier') {
        payload.supplier_id = data.supplier_id;
      }

      const { error } = await supabase
        .from('product_discounts')
        .update(payload)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast({ title: 'Desconto atualizado' });
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
        .from('product_discounts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast({ title: 'Desconto excluído' });
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
    if (formData.target_type !== 'supplier' && formData.target_ids.length === 0) return;
    if (formData.target_type === 'supplier' && !formData.supplier_id) return;

    if (editingDiscount) {
      updateMutation.mutate({ id: editingDiscount.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    let targetType: 'product' | 'brand' | 'category' | 'supplier' = 'product';
    let targetIds: string[] = [];
    let supplierId: string | null = null;

    if (discount.product_ids.length > 0) {
      targetType = 'product';
      targetIds = discount.product_ids;
    } else if (discount.brand_ids.length > 0) {
      targetType = 'brand';
      targetIds = discount.brand_ids;
    } else if (discount.category_ids.length > 0) {
      targetType = 'category';
      targetIds = discount.category_ids;
    } else if (discount.supplier_id) {
      targetType = 'supplier';
      supplierId = discount.supplier_id;
    }
    
    setFormData({
      name: discount.name,
      description: discount.description || '',
      discount_percentage: discount.discount_percentage,
      discount_amount: discount.discount_amount,
      start_date: discount.start_date.split('T')[0],
      end_date: discount.end_date.split('T')[0],
      is_active: discount.is_active,
      target_type: targetType,
      target_ids: targetIds,
      supplier_id: supplierId,
    });
    setDialogOpen(true);
  };

  const handleNewDiscount = () => {
    setEditingDiscount(null);
    setFormData({
      name: '',
      description: '',
      discount_percentage: 0,
      discount_amount: null,
      start_date: '',
      end_date: '',
      is_active: true,
      target_type: 'product',
      target_ids: [],
      supplier_id: null,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDiscount(null);
    setFormData({
      name: '',
      description: '',
      discount_percentage: 0,
      discount_amount: null,
      start_date: '',
      end_date: '',
      is_active: true,
      target_type: 'product',
      target_ids: [],
      supplier_id: null,
    });
  };

  const getTargetName = (discount: Discount) => {
    if (discount.product_ids.length > 0) {
      const names = discount.product_ids.map(id => {
        const product = products.find(p => p.id === id);
        return product?.name || id;
      });
      return `Produtos: ${names.join(', ')}`;
    }
    if (discount.brand_ids.length > 0) {
      const names = discount.brand_ids.map(id => {
        const brand = brands.find(b => b.id === id);
        return brand?.name || id;
      });
      return `Marcas: ${names.join(', ')}`;
    }
    if (discount.category_ids.length > 0) {
      const names = discount.category_ids.map(id => {
        const category = categories.find(c => c.id === id);
        return category?.name || id;
      });
      return `Categorias: ${names.join(', ')}`;
    }
    if (discount.supplier_id) {
      const supplier = suppliers.find(s => s.id === discount.supplier_id);
      return supplier ? `Fornecedor: ${supplier.name}` : 'Fornecedor';
    }
    return '-';
  };

  const isActiveDiscount = (discount: Discount) => {
    if (!discount.is_active) return false;
    const now = new Date();
    const start = new Date(discount.start_date);
    const end = new Date(discount.end_date);
    return now >= start && now <= end;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <RoleGuard requireManager>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Descontos Promocionais</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie descontos temporários (Black Friday, promoções, etc.)
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewDiscount}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Desconto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  {editingDiscount ? 'Editar Desconto' : 'Novo Desconto'}
                </DialogTitle>
                <DialogDescription>
                  Configure um desconto temporário para produtos, marcas ou categorias
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="name">Nome da Promoção</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Black Friday 2024"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detalhes sobre a promoção"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_percentage">Desconto (%)</Label>
                    <Input
                      id="discount_percentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_amount">Desconto Fixo (R$)</Label>
                    <Input
                      id="discount_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount_amount || ''}
                      onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="Opcional"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_date">Data Início</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">Data Fim</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="target_type">Aplicar em</Label>
                    <Select
                      value={formData.target_type}
                      onValueChange={(value: any) => setFormData({ ...formData, target_type: value, target_ids: [], supplier_id: null })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Produtos Específicos</SelectItem>
                        <SelectItem value="brand">Marcas</SelectItem>
                        <SelectItem value="category">Categorias</SelectItem>
                        <SelectItem value="supplier">Fornecedor (todas marcas)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.target_type === 'supplier' ? (
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="supplier_id">Fornecedor</Label>
                      <Select
                        value={formData.supplier_id || ''}
                        onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o fornecedor..." />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="col-span-2 space-y-2">
                      <Label>
                        {formData.target_type === 'product' ? 'Produtos' : formData.target_type === 'brand' ? 'Marcas' : 'Categorias'} (múltipla seleção)
                      </Label>
                      <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                        {formData.target_type === 'product' && products.map((p) => (
                          <div key={p.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`product-${p.id}`}
                              checked={formData.target_ids.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, target_ids: [...formData.target_ids, p.id] });
                                } else {
                                  setFormData({ ...formData, target_ids: formData.target_ids.filter(id => id !== p.id) });
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor={`product-${p.id}`} className="text-sm cursor-pointer">{p.name}</label>
                          </div>
                        ))}
                        {formData.target_type === 'brand' && brands.map((b) => (
                          <div key={b.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`brand-${b.id}`}
                              checked={formData.target_ids.includes(b.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, target_ids: [...formData.target_ids, b.id] });
                                } else {
                                  setFormData({ ...formData, target_ids: formData.target_ids.filter(id => id !== b.id) });
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor={`brand-${b.id}`} className="text-sm cursor-pointer">{b.name}</label>
                          </div>
                        ))}
                        {formData.target_type === 'category' && categories.map((c) => (
                          <div key={c.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`category-${c.id}`}
                              checked={formData.target_ids.includes(c.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, target_ids: [...formData.target_ids, c.id] });
                                } else {
                                  setFormData({ ...formData, target_ids: formData.target_ids.filter(id => id !== c.id) });
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor={`category-${c.id}`} className="text-sm cursor-pointer">{c.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

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
                      {editingDiscount ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Descontos Cadastrados</CardTitle>
            <CardDescription>
              {discounts.length} desconto(s) configurado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Promoção</TableHead>
                  <TableHead>Aplicado em</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{discount.name}</div>
                          {discount.description && (
                            <div className="text-xs text-muted-foreground">{discount.description}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{getTargetName(discount)}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-green-600">
                        {discount.discount_percentage}%
                        {discount.discount_amount && ` ou R$ ${discount.discount_amount}`}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{new Date(discount.start_date).toLocaleDateString('pt-BR')}</div>
                      <div className="text-xs text-muted-foreground">
                        até {new Date(discount.end_date).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${isActiveDiscount(discount) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {isActiveDiscount(discount) ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(discount)}>
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
                              <AlertDialogTitle>Excluir desconto</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir "{discount.name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(discount.id)}
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