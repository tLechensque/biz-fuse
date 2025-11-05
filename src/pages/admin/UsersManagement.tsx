import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Trash2, Loader2, RotateCcw, Mail, KeyRound } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { InviteUserDialog } from '@/components/InviteUserDialog';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: 'administrador' | 'gerente' | 'vendedor' | null;
  created_at: string;
  last_sign_in_at: string | null;
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
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, name, created_at');

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
          name: profile.name,
          created_at: profile.created_at,
          role: userRole ? (userRole as any).role : null,
          last_sign_in_at: null,
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sem sessão ativa');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'delete',
            userId: userToDelete,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      toast({
        title: 'Usuário excluído',
        description: 'O usuário foi removido do sistema.',
      });

      loadUsers();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir usuário',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUserToDelete(null);
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sem sessão ativa');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'reset_password',
            userId,
            email,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      toast({
        title: 'Email enviado',
        description: `Email de redefinição de senha enviado para ${email}`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao resetar senha',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleResendInvite = async (userId: string, email: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sem sessão ativa');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'resend_invite',
            userId,
            email,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      toast({
        title: 'Convite reenviado',
        description: `Convite reenviado para ${email}`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao reenviar convite',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <RoleGuard requireAdmin>
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
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleResetPassword(u.id, u.email)}>
                                <KeyRound className="h-4 w-4 mr-2" />
                                Resetar Senha
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResendInvite(u.id, u.email)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Reenviar Convite
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => setUserToDelete(u.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir Usuário
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            <AlertDialogTitle>Excluir usuário permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá permanentemente o usuário do sistema, incluindo todas as suas permissões e dados. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSuccess={loadUsers}
      />
    </RoleGuard>
  );
}
