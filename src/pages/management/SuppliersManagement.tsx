import { useState } from 'react';
import InputMask from 'react-input-mask';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, Building2, Phone, Mail, FileText, Upload, Package } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';

interface Supplier {
  id: string;
  name: string;
  cnpj: string | null;
  contact_name: string | null;
  email: string | null;
  whatsapp: string | null;
  brand_ids: string[];
  is_active: boolean;
  created_at: string;
}

interface PriceTable {
  id: string;
  name: string;
  supplier_ids: string[];
}

interface Brand {
  id: string;
  name: string;
  supplier_id: string | null;
}

export default function SuppliersManagement() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    contact_name: '',
    email: '',
    whatsapp: '',
    brand_ids: [] as string[],
    is_active: true,
  });

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('organization_id', profile?.organization_id!)
        .order('name');
      
      if (error) throw error;
      return data as Supplier[];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: brands = [] } = useQuery({
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
        .select('id, name, supplier_ids')
        .eq('organization_id', profile?.organization_id!)
        .order('name');
      
      if (error) throw error;
      return data as PriceTable[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: created, error } = await supabase
        .from('suppliers')
        .insert({ ...data, organization_id: profile?.organization_id })
        .select('id')
        .single();
      if (error) throw error;
      return created;
    },
    onSuccess: async (created) => {
      // Vincular marcas selecionadas a este fornecedor
      if (formData.brand_ids.length > 0) {
        await supabase
          .from('brands')
          .update({ supplier_id: created.id })
          .in('id', formData.brand_ids);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
        queryClient.invalidateQueries({ queryKey: ['suppliers-list'] }),
        queryClient.invalidateQueries({ queryKey: ['brands'] }),
      ]);

      toast({ title: 'Fornecedor criado com sucesso' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar fornecedor',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('suppliers')
        .update(data)
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: async (id: string) => {
      // Sincronizar relação marca ↔ fornecedor
      const previous = editingSupplier?.brand_ids || [];
      const added = formData.brand_ids.filter((b) => !previous.includes(b));
      const removed = previous.filter((b) => !formData.brand_ids.includes(b));

      if (added.length > 0) {
        await supabase.from('brands').update({ supplier_id: id }).in('id', added);
      }
      if (removed.length > 0) {
        await supabase
          .from('brands')
          .update({ supplier_id: null })
          .in('id', removed)
          .eq('supplier_id', id);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
        queryClient.invalidateQueries({ queryKey: ['suppliers-list'] }),
        queryClient.invalidateQueries({ queryKey: ['brands'] }),
      ]);

      toast({ title: 'Fornecedor atualizado' });
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
        .from('suppliers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
        queryClient.invalidateQueries({ queryKey: ['suppliers-list'] }),
      ]);
      toast({ title: 'Fornecedor excluído' });
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

    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      cnpj: supplier.cnpj || '',
      contact_name: supplier.contact_name || '',
      email: supplier.email || '',
      whatsapp: supplier.whatsapp || '',
      brand_ids: supplier.brand_ids || [],
      is_active: supplier.is_active,
    });
    setDialogOpen(true);
  };

  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      cnpj: '',
      contact_name: '',
      email: '',
      whatsapp: '',
      brand_ids: [],
      is_active: true,
    });
    setDialogOpen(true);
  };

  const toggleBrand = (brandId: string) => {
    setFormData(prev => ({
      ...prev,
      brand_ids: prev.brand_ids.includes(brandId)
        ? prev.brand_ids.filter(id => id !== brandId)
        : [...prev.brand_ids, brandId]
    }));
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSupplier(null);
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
            <h1 className="text-3xl font-bold">Fornecedores</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus fornecedores e marcas associadas
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewSupplier}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </DialogTitle>
                <DialogDescription>
                  Cadastre os dados completos do fornecedor
                </DialogDescription>
              </DialogHeader>
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2 space-y-2">
                     <Label htmlFor="name">Nome do Fornecedor*</Label>
                     <Input
                       id="name"
                       value={formData.name}
                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                       placeholder="Nome do fornecedor"
                       required
                     />
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="cnpj">CNPJ</Label>
                     <InputMask
                       mask="99.999.999/9999-99"
                       value={formData.cnpj}
                       onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                     >
                       {(inputProps: any) => (
                         <Input
                           {...inputProps}
                           id="cnpj"
                           placeholder="00.000.000/0000-00"
                         />
                       )}
                     </InputMask>
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="contact_name">Nome do Contato</Label>
                     <Input
                       id="contact_name"
                       value={formData.contact_name}
                       onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                       placeholder="Pessoa de contato"
                     />
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="email">E-mail</Label>
                     <Input
                       id="email"
                       type="email"
                       value={formData.email}
                       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                       placeholder="contato@fornecedor.com"
                     />
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="whatsapp">WhatsApp</Label>
                     <InputMask
                       mask="(99) 99999-9999"
                       value={formData.whatsapp}
                       onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                     >
                       {(inputProps: any) => (
                         <Input
                           {...inputProps}
                           id="whatsapp"
                           placeholder="(00) 00000-0000"
                         />
                       )}
                     </InputMask>
                   </div>

                   <div className="col-span-2 space-y-2">
                     <Label>Marcas Representadas</Label>
                     <div className="p-4 border rounded-lg space-y-2 max-h-40 overflow-y-auto">
                       {brands.length > 0 ? (
                         brands.map(brand => (
                           <div key={brand.id} className="flex items-center gap-2">
                             <input
                               type="checkbox"
                               checked={formData.brand_ids.includes(brand.id)}
                               onChange={() => toggleBrand(brand.id)}
                               className="rounded"
                             />
                             <Label className="cursor-pointer flex items-center gap-1">
                               <Package className="h-3 w-3" />
                               {brand.name}
                             </Label>
                           </div>
                         ))
                       ) : (
                         <p className="text-sm text-muted-foreground">Nenhuma marca cadastrada</p>
                       )}
                     </div>
                   </div>

                   {editingSupplier && (
                     <div className="col-span-2 space-y-2">
                       <Label>Tabelas de Preços Associadas</Label>
                       <div className="p-4 border rounded-lg bg-muted/30">
                         {priceTables.filter(pt => pt.supplier_ids?.includes(editingSupplier.id)).length > 0 ? (
                           <div className="flex flex-wrap gap-2">
                             {priceTables
                               .filter(pt => pt.supplier_ids?.includes(editingSupplier.id))
                               .map(table => (
                                 <Badge key={table.id} variant="secondary" className="flex items-center gap-1">
                                   <FileText className="h-3 w-3" />
                                   {table.name}
                                 </Badge>
                               ))}
                           </div>
                         ) : (
                           <p className="text-sm text-muted-foreground">
                             Nenhuma tabela de preços associada
                           </p>
                         )}
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
                    <Label htmlFor="is_active">Fornecedor Ativo</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingSupplier ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fornecedores Cadastrados</CardTitle>
            <CardDescription>
              {suppliers.length} fornecedor(es) cadastrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                 <TableRow>
                   <TableHead>Nome</TableHead>
                   <TableHead>CNPJ</TableHead>
                   <TableHead>Contato</TableHead>
                   <TableHead>Marcas</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead className="text-right">Ações</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {suppliers.map((supplier) => (
                   <TableRow key={supplier.id}>
                     <TableCell>
                       <div className="flex items-center gap-2">
                         <Building2 className="h-4 w-4 text-muted-foreground" />
                         <div className="font-medium">{supplier.name}</div>
                       </div>
                     </TableCell>
                     <TableCell>{supplier.cnpj || '-'}</TableCell>
                     <TableCell>
                       <div className="space-y-1 text-sm">
                         {supplier.contact_name && (
                           <div className="font-medium">{supplier.contact_name}</div>
                         )}
                         {supplier.email && (
                           <div className="text-muted-foreground">{supplier.email}</div>
                         )}
                         {supplier.whatsapp && (
                           <div className="text-muted-foreground">{supplier.whatsapp}</div>
                         )}
                       </div>
                     </TableCell>
                     <TableCell>
                       <div className="flex flex-wrap gap-1 max-w-[200px]">
                         {supplier.brand_ids && supplier.brand_ids.length > 0 ? (
                           supplier.brand_ids.slice(0, 3).map(brandId => {
                             const brand = brands.find(b => b.id === brandId);
                             return brand ? (
                               <Badge key={brandId} variant="outline" className="text-xs">
                                 {brand.name}
                               </Badge>
                             ) : null;
                           })
                         ) : (
                           <span className="text-sm text-muted-foreground">-</span>
                         )}
                         {supplier.brand_ids && supplier.brand_ids.length > 3 && (
                           <Badge variant="outline" className="text-xs">
                             +{supplier.brand_ids.length - 3}
                           </Badge>
                         )}
                       </div>
                     </TableCell>
                    <TableCell>
                      <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                        {supplier.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(supplier)}
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
                              <AlertDialogTitle>Excluir fornecedor</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir "{supplier.name}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(supplier.id)}
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
