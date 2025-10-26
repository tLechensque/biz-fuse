import { ReactNode } from 'react';
import { useAuthorization, AppRole } from '@/hooks/useAuthorization';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: AppRole;
  requireAdmin?: boolean;
  requireManager?: boolean;
  fallback?: ReactNode;
}

/**
 * RoleGuard - Protects components/pages based on user roles
 * Uses server-side SECURITY DEFINER functions via RPC for security
 * Never checks roles using client-side storage or direct queries
 */
export function RoleGuard({ 
  children, 
  requiredRole, 
  requireAdmin, 
  requireManager,
  fallback 
}: RoleGuardProps) {
  const { hasRole, isAdmin, isManager, isLoading } = useAuthorization();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Check role requirements
  const hasAccess = 
    (requireAdmin && isAdmin()) ||
    (requireManager && (isManager() || isAdmin())) ||
    (requiredRole && hasRole(requiredRole));

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Você não tem permissão para acessar este recurso.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
