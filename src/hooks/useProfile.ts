import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createProfileMutation = useMutation({
    mutationFn: async (profileData: { name: string; email: string }) => {
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: profileData.name,
          email: profileData.email,
          role: 'USER',
          organization_id: '550e8400-e29b-41d4-a716-446655440000' // Default demo organization
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Perfil criado',
        description: 'Seu perfil foi criado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar perfil',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    profile,
    isLoading,
    createProfile: createProfileMutation.mutate,
    isCreatingProfile: createProfileMutation.isPending,
  };
};