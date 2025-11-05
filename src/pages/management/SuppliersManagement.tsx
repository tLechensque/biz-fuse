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
  razao_social: string | null;
  cnpj: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
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
    razao_social: '',
    cnpj: '',
    contact_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    notes: '',
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

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('suppliers')
        .insert({ ...data, organization_id: profile?.organization_id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
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
      razao_social: supplier.razao_social || '',
      cnpj: supplier.cnpj || '',
      contact_name: supplier.contact_name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      whatsapp: supplier.whatsapp || '',
      address: supplier.address || '',
      notes: supplier.notes || '',
      is_active: supplier.is_active,
    });
    setDialogOpen(true);
  };

  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      razao_social: '',
      cnpj: '',
      contact_name: '',
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      notes: '',
      is_active: true,
    });
    setDialogOpen(true);
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
                    <Label htmlFor="name">Nome Fantasia*</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome comercial"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="razao_social">Razão Social</Label>
                    <Input
                      id="razao_social"
                      value={formData.razao_social}
                      onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                      placeholder="Razão social completa"
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
                    <Label htmlFor="phone">Telefone</Label>
                    <InputMask
                      mask="(99) 9999-9999"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    >
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          id="phone"
                          placeholder="(00) 0000-0000"
                        />
                      )}
                    </InputMask>
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
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Endereço completo"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Informações adicionais sobre o fornecedor"
                      rows={3}
                    />
                  </div>

                  {editingSupplier && (
                    <div className="col-span-2 space-y-2">
                      <Label>Marcas Associadas</Label>
                      <div className="p-4 border rounded-lg bg-muted/30">
                        {brands.filter(b => b.supplier_id === editingSupplier.id).length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {brands
                              .filter(b => b.supplier_id === editingSupplier.id)
                              .map(brand => (
                                <Badge key={brand.id} variant="secondary" className="flex items-center gap-1">
                                  <Package className="h-3 w-3" />
                                  {brand.name}
                                </Badge>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Nenhuma marca associada. Vincule marcas na página de Marcas.
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
                  <TableHead>Contato</TableHead>
                  <TableHead>CNPJ</TableHead>
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
                        <div>
                          <div className="font-medium">{supplier.name}</div>
                          {supplier.razao_social && (
                            <div className="text-sm text-muted-foreground">
                              {supplier.razao_social}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {supplier.contact_name && (
                          <div>{supplier.contact_name}</div>
                        )}
                        {supplier.email && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {supplier.email}
                          </div>
                        )}
                        {supplier.whatsapp && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {supplier.whatsapp}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{supplier.cnpj || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {brands.filter(b => b.supplier_id === supplier.id).length > 0 ? (
                          brands
                            .filter(b => b.supplier_id === supplier.id)
                            .slice(0, 3)
                            .map(brand => (
                              <Badge key={brand.id} variant="outline" className="text-xs">
                                {brand.name}
                              </Badge>
                            ))
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                        {brands.filter(b => b.supplier_id === supplier.id).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{brands.filter(b => b.supplier_id === supplier.id).length - 3}
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
