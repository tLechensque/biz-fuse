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
import { Loader2, Building2, Save } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function OrganizationSettings() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    razao_social: '',
    cnpj: '',
    endereco: '',
    whatsapp: '',
    telefone: '',
    email: '',
    tipo: 'matriz' as 'matriz' | 'filial' | 'independente',
    settings: {} as any,
  });

  const { isLoading } = useQuery({
    queryKey: ['organization', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile?.organization_id!)
        .single();
      
      if (error) throw error;
      
      setFormData({
        name: data.name,
        razao_social: data.razao_social || '',
        cnpj: data.cnpj || '',
        endereco: data.endereco || '',
        whatsapp: data.whatsapp || '',
        telefone: data.telefone || '',
        email: data.email || '',
        tipo: (data.tipo || 'matriz') as 'matriz' | 'filial' | 'independente',
        settings: data.settings || {},
      });
      
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('organizations')
        .update(data)
        .eq('id', profile?.organization_id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast({ title: 'Organização atualizada com sucesso' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar organização',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
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
        <div>
          <h1 className="text-3xl font-bold">Configurações da Organização</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as informações e configurações da sua organização
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações Gerais
              </CardTitle>
              <CardDescription>
                Dados básicos da organização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Fantasia</Label>
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
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Endereço completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp (Principal)</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone Adicional (Opcional)</Label>
                  <InputMask
                    mask="(99) 9999-9999"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  >
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        id="telefone"
                        placeholder="(00) 0000-0000"
                      />
                    )}
                  </InputMask>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <Card>
          <CardHeader>
            <CardTitle>Resumo da Organização</CardTitle>
            <CardDescription>
              Informações principais da empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between p-4 border rounded-lg bg-muted/50">
                <div className="space-y-3 flex-1">
                  <div>
                    <h3 className="text-2xl font-bold">{formData.name || 'Nome da Empresa'}</h3>
                    <p className="text-sm text-muted-foreground">{formData.razao_social || 'Razão Social não informada'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">CNPJ:</span>
                      <p className="font-medium">{formData.cnpj || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>
                      <p className="font-medium capitalize">{formData.tipo}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">WhatsApp:</span>
                      <p className="font-medium">{formData.whatsapp || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">E-mail:</span>
                      <p className="font-medium">{formData.email || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <span>ID da Organização: </span>
                <span className="font-mono">{profile?.organization_id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}