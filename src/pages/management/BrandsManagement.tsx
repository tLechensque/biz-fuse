import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Loader2, Package, FileText, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Brand {
  id: string;
  name: string;
  supplier_id: string | null;
  discount_percentage: number;
  created_at: string;
}

interface PriceTable {
  id: string;
  name: string;
  pdf_url: string;
  brand_ids: string[];
}

export default function BrandsManagement() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    supplier_id: null as string | null,
    discount_percentage: 0,
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

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['brands', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('organization_id', profile?.organization_id!)
        .order('name');
      
      if (error) throw error;
      return data as Brand[];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: priceTables = [] } = useQuery({
    queryKey: ['price_tables', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_tables')
        .select('id, name, pdf_url, brand_ids')
        .eq('organization_id', profile?.organization_id!)
        .order('name');
      
      if (error) throw error;
      return data as PriceTable[];
    },
    enabled: !!profile?.organization_id,
  });

  const handleOpenPdf = async (pdfPath: string, tableName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('price-lists')
        .createSignedUrl(pdfPath, 3600); // URL válida por 1 hora

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao abrir PDF',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: newBrand, error } = await supabase
        .from('brands')
        .insert({ ...data, organization_id: profile?.organization_id })
        .select()
        .single();
      if (error) throw error;

      // Se fornecedor foi selecionado, atualizar brand_ids do fornecedor
      if (data.supplier_id && newBrand) {
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('brand_ids')
          .eq('id', data.supplier_id)
          .single();

        if (supplier) {
          const currentBrandIds = supplier.brand_ids || [];
          const updatedBrandIds = [...currentBrandIds, newBrand.id];
          await supabase
            .from('suppliers')
            .update({ brand_ids: updatedBrandIds })
            .eq('id', data.supplier_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers-list'] });
      toast({ title: 'Marca criada com sucesso' });
      setDialogOpen(false);
      setFormData({ name: '', supplier_id: null, discount_percentage: 0 });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar marca',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const oldBrand = editingBrand;
      
      const { error } = await supabase
        .from('brands')
        .update(data)
        .eq('id', id);
      if (error) throw error;

      // Remover marca do fornecedor antigo se mudou
      if (oldBrand?.supplier_id && oldBrand.supplier_id !== data.supplier_id) {
        const { data: oldSupplier } = await supabase
          .from('suppliers')
          .select('brand_ids')
          .eq('id', oldBrand.supplier_id)
          .single();

        if (oldSupplier) {
          const updatedBrandIds = (oldSupplier.brand_ids || []).filter((bid: string) => bid !== id);
          await supabase
            .from('suppliers')
            .update({ brand_ids: updatedBrandIds })
            .eq('id', oldBrand.supplier_id);
        }
      }

      // Adicionar marca ao novo fornecedor
      if (data.supplier_id && data.supplier_id !== oldBrand?.supplier_id) {
        const { data: newSupplier } = await supabase
          .from('suppliers')
          .select('brand_ids')
          .eq('id', data.supplier_id)
          .single();

        if (newSupplier) {
          const currentBrandIds = newSupplier.brand_ids || [];
          if (!currentBrandIds.includes(id)) {
            const updatedBrandIds = [...currentBrandIds, id];
            await supabase
              .from('suppliers')
              .update({ brand_ids: updatedBrandIds })
              .eq('id', data.supplier_id);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers-list'] });
      toast({ title: 'Marca atualizada com sucesso' });
      setDialogOpen(false);
      setEditingBrand(null);
      setFormData({ name: '', supplier_id: null, discount_percentage: 0 });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar marca',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast({ title: 'Marca excluída com sucesso' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir marca',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      supplier_id: brand.supplier_id,
      discount_percentage: brand.discount_percentage || 0,
    });
    setDialogOpen(true);
  };

  const handleNewBrand = () => {
    setEditingBrand(null);
    setFormData({ name: '', supplier_id: null, discount_percentage: 0 });
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marcas</h1>
          <p className="text-muted-foreground mt-2">Gerencie as marcas de produtos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewBrand}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Marca
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {editingBrand ? 'Editar Marca' : 'Nova Marca'}
              </DialogTitle>
              <DialogDescription>
                {editingBrand ? 'Altere o nome da marca' : 'Adicione uma nova marca de produtos'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Marca</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Samsung, Apple, Nike"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier_id">Fornecedor (Opcional)</Label>
                <Select
                  value={formData.supplier_id || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, supplier_id: value === 'none' ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {suppliers.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_percentage">Desconto Padrão (%)</Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) || 0 })}
                  placeholder="Ex: 50 para 50% de desconto"
                />
                <p className="text-xs text-muted-foreground">
                  Desconto aplicado sobre o valor de venda para calcular o custo automaticamente
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingBrand ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Marcas</CardTitle>
          <CardDescription>
            {brands.length} marca(s) cadastrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Desconto Padrão</TableHead>
                <TableHead>Tabelas de Preço</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => {
                const associatedTables = priceTables.filter(pt => 
                  pt.brand_ids?.includes(brand.id)
                );
                
                return (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {brand.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {brand.supplier_id ? (
                        suppliers.find((s: any) => s.id === brand.supplier_id)?.name || '-'
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-primary">
                        {brand.discount_percentage}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {associatedTables.length > 0 ? (
                        <div className="flex flex-col gap-1 max-w-[250px]">
                          {associatedTables.slice(0, 2).map(table => (
                            <button
                              key={table.id}
                              onClick={() => handleOpenPdf(table.pdf_url, table.name)}
                              className="flex items-center gap-1 text-xs text-primary hover:underline text-left"
                            >
                              <FileText className="h-3 w-3" />
                              {table.name}
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          ))}
                          {associatedTables.length > 2 && (
                            <Badge variant="outline" className="text-xs w-fit">
                              +{associatedTables.length - 2} mais
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(brand.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(brand)}
                      >
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
                            <AlertDialogTitle>Excluir marca</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir "{brand.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(brand.id)}
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
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}