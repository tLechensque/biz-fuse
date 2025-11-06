import { useState } from 'react';
import InputMask from 'react-input-mask';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Building2, Save, Plus, Pencil, Trash2, Phone, X, Search, Upload, Image as ImageIcon } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { ImageUpload } from '@/components/ui/image-upload';

interface Organization {
  id: string;
  name: string;
  razao_social: string | null;
  cnpj: string | null;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  whatsapp: string | null;
  telefone: string | null;
  email: string | null;
  tipo: 'matriz' | 'filial' | 'independente';
  logo_url: string | null;
  created_at: string;
}

export default function OrganizationSettings() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [additionalPhone, setAdditionalPhone] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    razao_social: '',
    cnpj: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    whatsapp: '',
    telefone: '',
    email: '',
    tipo: 'independente' as 'matriz' | 'filial' | 'independente',
    logo_url: '',
  });

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Organization[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('organizations')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast({ title: 'Organização criada com sucesso' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar organização',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('organizations')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast({ title: 'Organização atualizada com sucesso' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar organização',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast({ title: 'Organização excluída' });
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

    if (editingOrg) {
      updateMutation.mutate({ id: editingOrg.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      razao_social: org.razao_social || '',
      cnpj: org.cnpj || '',
      cep: org.cep || '',
      rua: org.rua || '',
      numero: org.numero || '',
      complemento: org.complemento || '',
      bairro: org.bairro || '',
      cidade: org.cidade || '',
      estado: org.estado || '',
      whatsapp: org.whatsapp || '',
      telefone: org.telefone || '',
      email: org.email || '',
      tipo: org.tipo,
      logo_url: org.logo_url || '',
    });
    setAdditionalPhone(!!org.telefone);
    setDialogOpen(true);
  };

  const handleLogoUpload = async (file: File) => {
    if (!editingOrg && !profile?.organization_id) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.user_id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName);

      setFormData({ ...formData, logo_url: publicUrl });
      
      toast({ title: 'Logo enviado com sucesso' });
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer upload',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleNewOrg = () => {
    setEditingOrg(null);
    setFormData({
      name: '',
      razao_social: '',
      cnpj: '',
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      whatsapp: '',
      telefone: '',
      email: '',
      tipo: 'independente',
      logo_url: '',
    });
    setAdditionalPhone(false);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingOrg(null);
    setAdditionalPhone(false);
  };

  const handleSearchCep = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      toast({
        title: 'CEP inválido',
        description: 'Digite um CEP válido com 8 dígitos',
        variant: 'destructive',
      });
      return;
    }

    setSearchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast({
          title: 'CEP não encontrado',
          description: 'Verifique o CEP digitado',
          variant: 'destructive',
        });
        return;
      }

      setFormData({
        ...formData,
        rua: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
        complemento: data.complemento || '',
      });

      toast({ title: 'Endereço encontrado com sucesso!' });
    } catch (error) {
      toast({
        title: 'Erro ao buscar CEP',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setSearchingCep(false);
    }
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
            <h1 className="text-3xl font-bold">Organizações</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas empresas, matriz, filiais e independentes
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewOrg}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Organização
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {editingOrg ? 'Editar Organização' : 'Nova Organização'}
                </DialogTitle>
                <DialogDescription>
                  Configure os dados da empresa
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Logo Upload */}
                <div className="space-y-2 pb-4 border-b">
                  <Label>Logomarca da Empresa</Label>
                  <div className="flex items-center gap-4">
                    {formData.logo_url ? (
                      <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                        <img
                          src={formData.logo_url}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => setFormData({ ...formData, logo_url: '' })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <label className="w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground text-center px-2">
                          Clique para enviar
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(file);
                          }}
                          disabled={uploadingLogo}
                        />
                      </label>
                    )}
                    {uploadingLogo && (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: JPG, PNG, SVG, WEBP • Tamanho máximo: 5MB
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Fantasia *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome comercial"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Organização</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="matriz">Matriz</SelectItem>
                        <SelectItem value="filial">Filial</SelectItem>
                        <SelectItem value="independente">Independente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 space-y-2">
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
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contato@empresa.com"
                    />
                  </div>

                  <div className="col-span-2 space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Endereço</h3>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-3 space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <InputMask
                          mask="99999-999"
                          value={formData.cep}
                          onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                        >
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              id="cep"
                              placeholder="00000-000"
                            />
                          )}
                        </InputMask>
                      </div>
                      <div className="space-y-2">
                        <Label>&nbsp;</Label>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={handleSearchCep}
                          disabled={searchingCep || !formData.cep}
                        >
                          {searchingCep ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Search className="h-4 w-4 mr-2" />
                              Buscar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="rua">Rua</Label>
                        <Input
                          id="rua"
                          value={formData.rua}
                          onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                          placeholder="Nome da rua"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número</Label>
                        <Input
                          id="numero"
                          value={formData.numero}
                          onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                          placeholder="Nº"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="complemento">Complemento</Label>
                        <Input
                          id="complemento"
                          value={formData.complemento}
                          onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                          placeholder="Apto, sala, etc"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input
                          id="bairro"
                          value={formData.bairro}
                          onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                          placeholder="Bairro"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                          id="cidade"
                          value={formData.cidade}
                          onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                          placeholder="Cidade"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        placeholder="UF"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
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
                          required
                        />
                      )}
                    </InputMask>
                  </div>

                  <div className="space-y-2">
                    {!additionalPhone ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-8"
                        onClick={() => setAdditionalPhone(true)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Adicionar Telefone Adicional
                      </Button>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="telefone">Telefone Adicional</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAdditionalPhone(false);
                              setFormData({ ...formData, telefone: '' });
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        </div>
                        <InputMask
                          mask="(99) 99999-9999"
                          value={formData.telefone}
                          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        >
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              id="telefone"
                              placeholder="(00) 00000-0000"
                            />
                          )}
                        </InputMask>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingOrg ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => (
            <Card key={org.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <span>{org.name}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded capitalize">
                    {org.tipo}
                  </span>
                </CardTitle>
                <CardDescription>
                  {org.razao_social || 'Razão social não informada'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {org.cnpj && (
                    <div>
                      <span className="text-muted-foreground">CNPJ: </span>
                      <span className="font-medium">{org.cnpj}</span>
                    </div>
                  )}
                  {(org.rua || org.cep) && (
                    <div>
                      <span className="text-muted-foreground">Endereço: </span>
                      <span className="font-medium">
                        {[
                          org.rua,
                          org.numero,
                          org.complemento,
                          org.bairro,
                          org.cidade,
                          org.estado,
                          org.cep
                        ].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {org.whatsapp && (
                    <div>
                      <span className="text-muted-foreground">WhatsApp: </span>
                      <span className="font-medium">{org.whatsapp}</span>
                    </div>
                  )}
                  {org.telefone && (
                    <div>
                      <span className="text-muted-foreground">Tel. Adicional: </span>
                      <span className="font-medium">{org.telefone}</span>
                    </div>
                  )}
                  {org.email && (
                    <div>
                      <span className="text-muted-foreground">E-mail: </span>
                      <span className="font-medium">{org.email}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(org)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Organização</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir "{org.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(org.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {organizations.length === 0 && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhuma organização cadastrada</p>
              <p className="text-sm text-muted-foreground mb-4">
                Comece criando sua primeira organização
              </p>
              <Button onClick={handleNewOrg}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Organização
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}