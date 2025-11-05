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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Loader2, FileText, Upload, Package, Building2 } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';

interface PriceTable {
  id: string;
  name: string;
  description: string | null;
  pdf_url: string;
  supplier_ids: string[];
  brand_ids: string[];
  is_active: boolean;
  created_at: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function PriceTablesManagement() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<PriceTable | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pdf_url: '',
    supplier_ids: [] as string[],
    brand_ids: [] as string[],
    is_active: true,
  });

  const { data: priceTables = [], isLoading } = useQuery({
    queryKey: ['price_tables', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_tables')
        .select('*')
        .eq('organization_id', profile?.organization_id!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PriceTable[];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers-list', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('organization_id', profile?.organization_id!)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Supplier[];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands-list', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name')
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
        .from('price_tables')
        .insert({ ...data, organization_id: profile?.organization_id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price_tables'] });
      toast({ title: 'Tabela de preços criada com sucesso' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar tabela',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('price_tables')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price_tables'] });
      toast({ title: 'Tabela de preços atualizada' });
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
        .from('price_tables')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price_tables'] });
      toast({ title: 'Tabela de preços excluída' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.organization_id) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, envie apenas arquivos PDF',
        variant: 'destructive',
      });
      return;
    }

    setUploadingPdf(true);
    try {
      const fileName = `${profile.organization_id}/${Date.now()}_${file.name}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('price-lists')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Usar o path do arquivo ao invés de URL pública (bucket é privado)
      const fileUrl = fileName;

      setFormData({ ...formData, pdf_url: fileUrl });
      toast({ title: 'PDF enviado com sucesso' });
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar PDF',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.pdf_url) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome e PDF são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (editingTable) {
      updateMutation.mutate({ id: editingTable.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (table: PriceTable) => {
    setEditingTable(table);
    setFormData({
      name: table.name,
      description: table.description || '',
      pdf_url: table.pdf_url,
      supplier_ids: table.supplier_ids || [],
      brand_ids: table.brand_ids || [],
      is_active: table.is_active,
    });
    setDialogOpen(true);
  };

  const handleNewTable = () => {
    setEditingTable(null);
    setFormData({
      name: '',
      description: '',
      pdf_url: '',
      supplier_ids: [],
      brand_ids: [],
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTable(null);
  };

  const toggleSupplier = (supplierId: string) => {
    setFormData(prev => ({
      ...prev,
      supplier_ids: prev.supplier_ids.includes(supplierId)
        ? prev.supplier_ids.filter(id => id !== supplierId)
        : [...prev.supplier_ids, supplierId]
    }));
  };

  const toggleBrand = (brandId: string) => {
    setFormData(prev => ({
      ...prev,
      brand_ids: prev.brand_ids.includes(brandId)
        ? prev.brand_ids.filter(id => id !== brandId)
        : [...prev.brand_ids, brandId]
    }));
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
            <h1 className="text-3xl font-bold">Tabelas de Preços</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie tabelas de preços em PDF vinculadas a fornecedores e marcas
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewTable}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tabela
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {editingTable ? 'Editar Tabela de Preços' : 'Nova Tabela de Preços'}
                </DialogTitle>
                <DialogDescription>
                  Faça upload do PDF e associe fornecedores e marcas
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="name">Nome da Tabela*</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Tabela 2024 - Fornecedor X"
                      required
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Informações adicionais sobre a tabela"
                      rows={2}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="pdf">Arquivo PDF*</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="pdf"
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        disabled={uploadingPdf}
                        className="flex-1"
                      />
                      {uploadingPdf && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                     {formData.pdf_url && (
                       <div className="flex items-center gap-2 text-sm text-green-600">
                         <FileText className="h-4 w-4" />
                         <span>PDF anexado com sucesso</span>
                       </div>
                     )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Fornecedores Associados</Label>
                    <div className="p-4 border rounded-lg space-y-2 max-h-40 overflow-y-auto">
                      {suppliers.length > 0 ? (
                        suppliers.map(supplier => (
                          <div key={supplier.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.supplier_ids.includes(supplier.id)}
                              onChange={() => toggleSupplier(supplier.id)}
                              className="rounded"
                            />
                            <Label className="cursor-pointer flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {supplier.name}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum fornecedor cadastrado</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Marcas Associadas</Label>
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
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Tabela Ativa</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingTable ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tabelas Cadastradas</CardTitle>
            <CardDescription>
              {priceTables.length} tabela(s) de preços cadastrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Fornecedores</TableHead>
                  <TableHead>Marcas</TableHead>
                  <TableHead>PDF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceTables.map((table) => (
                  <TableRow key={table.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{table.name}</div>
                        {table.description && (
                          <div className="text-sm text-muted-foreground">
                            {table.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {table.supplier_ids && table.supplier_ids.length > 0 ? (
                          table.supplier_ids.slice(0, 2).map(supplierId => {
                            const supplier = suppliers.find(s => s.id === supplierId);
                            return supplier ? (
                              <Badge key={supplierId} variant="outline" className="text-xs">
                                {supplier.name}
                              </Badge>
                            ) : null;
                          })
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                        {table.supplier_ids && table.supplier_ids.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{table.supplier_ids.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {table.brand_ids && table.brand_ids.length > 0 ? (
                          table.brand_ids.slice(0, 2).map(brandId => {
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
                        {table.brand_ids && table.brand_ids.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{table.brand_ids.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                     <TableCell>
                       <a 
                         href="#"
                         onClick={async (e) => {
                           e.preventDefault();
                           const { data } = await supabase.storage
                             .from('price-lists')
                             .createSignedUrl(table.pdf_url, 3600);
                           if (data?.signedUrl) {
                             window.open(data.signedUrl, '_blank');
                           }
                         }}
                         className="flex items-center gap-1 text-primary hover:underline"
                       >
                         <FileText className="h-4 w-4" />
                         Ver PDF
                       </a>
                     </TableCell>
                    <TableCell>
                      <Badge variant={table.is_active ? 'default' : 'secondary'}>
                        {table.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(table)}
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
                              <AlertDialogTitle>Excluir tabela de preços</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir "{table.name}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(table.id)}
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