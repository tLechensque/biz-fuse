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
  product_id: string | null;
  brand_id: string | null;
  category_id: string | null;
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
    target_type: 'product' as 'product' | 'brand' | 'category',
    target_id: '',
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
        product_id: null,
        brand_id: null,
        category_id: null,
      };

      if (data.target_type === 'product') {
        payload.product_id = data.target_id;
      } else if (data.target_type === 'brand') {
        payload.brand_id = data.target_id;
      } else if (data.target_type === 'category') {
        payload.category_id = data.target_id;
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
        product_id: null,
        brand_id: null,
        category_id: null,
      };

      if (data.target_type === 'product') {
        payload.product_id = data.target_id;
      } else if (data.target_type === 'brand') {
        payload.brand_id = data.target_id;
      } else if (data.target_type === 'category') {
        payload.category_id = data.target_id;
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
    if (!formData.name.trim() || !formData.target_id) return;

    if (editingDiscount) {
      updateMutation.mutate({ id: editingDiscount.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    const targetType = discount.product_id ? 'product' : discount.brand_id ? 'brand' : 'category';
    const targetId = discount.product_id || discount.brand_id || discount.category_id || '';
    
    setFormData({
      name: discount.name,
      description: discount.description || '',
      discount_percentage: discount.discount_percentage,
      discount_amount: discount.discount_amount,
      start_date: discount.start_date.split('T')[0],
      end_date: discount.end_date.split('T')[0],
      is_active: discount.is_active,
      target_type: targetType,
      target_id: targetId,
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
      target_id: '',
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
      target_id: '',
    });
  };

  const getTargetName = (discount: Discount) => {
    if (discount.product_id) {
      const product = products.find(p => p.id === discount.product_id);
      return product ? `Produto: ${product.name}` : 'Produto';
    }
    if (discount.brand_id) {
      const brand = brands.find(b => b.id === discount.brand_id);
      return brand ? `Marca: ${brand.name}` : 'Marca';
    }
    if (discount.category_id) {
      const category = categories.find(c => c.id === discount.category_id);
      return category ? `Categoria: ${category.name}` : 'Categoria';
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

                  <div className="space-y-2">
                    <Label htmlFor="target_type">Aplicar em</Label>
                    <Select
                      value={formData.target_type}
                      onValueChange={(value: any) => setFormData({ ...formData, target_type: value, target_id: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Produto Específico</SelectItem>
                        <SelectItem value="brand">Marca Inteira</SelectItem>
                        <SelectItem value="category">Categoria Inteira</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_id">
                      {formData.target_type === 'product' ? 'Produto' : formData.target_type === 'brand' ? 'Marca' : 'Categoria'}
                    </Label>
                    <Select
                      value={formData.target_id}
                      onValueChange={(value) => setFormData({ ...formData, target_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.target_type === 'product' && products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                        {formData.target_type === 'brand' && brands.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                        {formData.target_type === 'category' && categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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