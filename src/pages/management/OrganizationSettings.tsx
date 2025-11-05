import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Building2, Save } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function OrganizationSettings() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
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
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Organização</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome da empresa"
                  required
                />
              </div>

              <div className="flex justify-end pt-4">
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
            <CardTitle>Informações do Sistema</CardTitle>
            <CardDescription>
              Dados sobre a organização no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID da Organização:</span>
                <span className="font-mono">{profile?.organization_id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}