import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Loader2, Settings } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface RolePermission {
  role: 'administrador' | 'gerente' | 'vendedor';
  permission_id: string;
}

const roles = ['administrador', 'gerente', 'vendedor'] as const;
const roleLabels = {
  administrador: 'Administrador',
  gerente: 'Gerente',
  vendedor: 'Vendedor',
};

export default function PermissionsManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    loadData();
  }, []);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'administrador')
        .maybeSingle();
      
      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (e) {
      console.error('Error checking admin status:', e);
      setIsAdmin(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [permissionsResult, rolePermissionsResult] = await Promise.all([
        supabase.from('permissions' as any).select('*').order('resource', { ascending: true }),
        supabase.from('role_permissions' as any).select('role, permission_id'),
      ]);

      if (permissionsResult.error) throw permissionsResult.error;
      if (rolePermissionsResult.error) throw rolePermissionsResult.error;

      setPermissions((permissionsResult.data as any) || []);
      setRolePermissions((rolePermissionsResult.data as any) || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar permissões',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (role: string, permissionId: string) => {
    return rolePermissions.some(
      (rp) => rp.role === role && rp.permission_id === permissionId
    );
  };

  const togglePermission = async (role: string, permissionId: string, currentValue: boolean) => {
    try {
      setUpdating(true);

      if (currentValue) {
        // Remove permission
        const { error } = await supabase
          .from('role_permissions' as any)
          .delete()
          .eq('role', role)
          .eq('permission_id', permissionId);

        if (error) throw error;
      } else {
        // Add permission
        const { error } = await supabase
          .from('role_permissions' as any)
          .insert({
            role,
            permission_id: permissionId,
            created_by: user?.id,
          });

        if (error) throw error;
      }

      await loadData();

      toast({
        title: 'Permissão atualizada',
        description: 'A permissão foi atualizada com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar permissão',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Acesso Negado
              </CardTitle>
              <CardDescription>
                Você não tem permissão para acessar esta página.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Permissões</h1>
            <p className="text-muted-foreground mt-2">
              Configure as permissões para cada role no sistema
            </p>
          </div>
        </div>

        <Tabs defaultValue={roles[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {roles.map((role) => (
              <TabsTrigger key={role} value={role}>
                {roleLabels[role]}
              </TabsTrigger>
            ))}
          </TabsList>

          {roles.map((role) => (
            <TabsContent key={role} value={role}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Permissões - {roleLabels[role]}
                  </CardTitle>
                  <CardDescription>
                    Configure quais ações este role pode executar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedPermissions).map(([resource, perms]) => (
                        <div key={resource} className="space-y-3">
                          <h3 className="font-semibold text-lg capitalize">
                            {resource}
                          </h3>
                          <div className="space-y-2">
                            {perms.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center space-x-3 rounded-lg border p-4"
                              >
                                <Checkbox
                                  id={`${role}-${permission.id}`}
                                  checked={hasPermission(role, permission.id)}
                                  onCheckedChange={() =>
                                    togglePermission(
                                      role,
                                      permission.id,
                                      hasPermission(role, permission.id)
                                    )
                                  }
                                  disabled={updating}
                                />
                                <div className="flex-1">
                                  <label
                                    htmlFor={`${role}-${permission.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {permission.name}
                                  </label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
}
