import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, UserPlus, Trash2, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { InviteUserDialog } from '@/components/InviteUserDialog';

interface UserWithRole {
  id: string;
  email: string;
  role: 'administrador' | 'gerente' | 'vendedor' | null;
  created_at: string;
}

const roleLabels = {
  administrador: 'Administrador',
  gerente: 'Gerente',
  vendedor: 'Vendedor',
};

const roleColors = {
  administrador: 'destructive',
  gerente: 'default',
  vendedor: 'secondary',
} as const;

export default function UsersManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    loadUsers();
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

  const loadUsers = async () => {
    try {
      setLoading(true);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, created_at');

      if (profilesError) throw profilesError;

      // Get roles for each user
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles' as any)
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile: any) => {
        const userRole = roles?.find(r => (r as any).user_id === profile.user_id);
        return {
          id: profile.user_id,
          email: profile.email,
          created_at: profile.created_at,
          role: userRole ? (userRole as any).role : null,
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar usuários',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Ensure a single role per user: delete all and insert one
      await supabase
        .from('user_roles' as any)
        .delete()
        .eq('user_id', userId);

      const { error } = await supabase
        .from('user_roles' as any)
        .insert({ user_id: userId, role: newRole, created_by: user?.id });

      if (error) throw error;

      toast({
        title: 'Role atualizada',
        description: 'A role do usuário foi atualizada com sucesso.',
      });

      loadUsers();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar role',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // First remove roles
      await supabase
        .from('user_roles' as any)
        .delete()
        .eq('user_id', userToDelete);

      // Note: Deleting from auth.users requires service role key
      // For now, we just remove the role. Consider using an edge function for full deletion.
      
      toast({
        title: 'Permissões removidas',
        description: 'As permissões do usuário foram removidas.',
      });

      loadUsers();
    } catch (error: any) {
      toast({
        title: 'Erro ao remover usuário',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUserToDelete(null);
    }
  };

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
            <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie usuários e suas permissões no sistema
            </p>
          </div>
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Convidar Usuário
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
            <CardDescription>
              Lista de todos os usuários e suas roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell>
                        {u.id === user?.id ? (
                          <Badge variant={u.role ? roleColors[u.role] : 'outline'}>
                            {u.role ? roleLabels[u.role] : 'Sem role'}
                          </Badge>
                        ) : (
                          <Select
                            value={u.role || ''}
                            onValueChange={(value) => handleRoleChange(u.id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Selecione uma role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="administrador">Administrador</SelectItem>
                              <SelectItem value="gerente">Gerente</SelectItem>
                              <SelectItem value="vendedor">Vendedor</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        {u.id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setUserToDelete(u.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover permissões do usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá todas as permissões deste usuário. O usuário ainda poderá fazer login mas não terá acesso a nenhuma funcionalidade.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSuccess={loadUsers}
      />
    </Layout>
  );
}
