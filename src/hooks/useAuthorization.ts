import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export type AppRole = 'administrador' | 'gerente' | 'vendedor' | 'visualizador';

export const useAuthorization = () => {
  const { user } = useAuth();

  // Use RPC to call SECURITY DEFINER functions instead of direct queries
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase.rpc('get_user_roles', {
        _user_id: user.id
      });

      if (error) throw error;
      return (data as AppRole[]) || [];
    },
    enabled: !!user,
  });

  const hasRole = (role: AppRole) => {
    return userRoles?.includes(role) || false;
  };

  const isAdmin = () => hasRole('administrador');
  const isManager = () => hasRole('gerente');
  const isSeller = () => hasRole('vendedor');
  const canManageUsers = () => isAdmin();
  const canManageProducts = () => isAdmin() || isManager();
  const canManageProposals = () => isAdmin() || isManager();
  const canViewReports = () => isAdmin() || isManager();

  return {
    userRoles: userRoles || [],
    isLoading,
    hasRole,
    isAdmin,
    isManager,
    isSeller,
    canManageUsers,
    canManageProducts,
    canManageProposals,
    canViewReports,
  };
};
