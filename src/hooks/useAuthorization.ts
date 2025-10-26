import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export type AppRole = 'administrador' | 'gerente' | 'vendedor' | 'visualizador';

export const useAuthorization = () => {
  const { user } = useAuth();

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      return data?.map(r => r.role as AppRole) || [];
    },
    enabled: !!user,
  });

  const hasRole = (role: AppRole) => {
    return userRoles?.includes(role) || false;
  };

  const isAdmin = () => hasRole('administrador');
  const isManager = () => hasRole('gerente');
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
    canManageUsers,
    canManageProducts,
    canManageProposals,
    canViewReports,
  };
};
