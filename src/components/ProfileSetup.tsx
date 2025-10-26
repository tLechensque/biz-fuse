import { useEffect } from 'react';
import { useAuth } from './auth/AuthProvider';
import { useProfile } from '@/hooks/useProfile';

interface ProfileSetupProps {
  children: React.ReactNode;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ children }) => {
  const { user } = useAuth();
  const { profile, createProfile, isLoading, isCreatingProfile } = useProfile();

  useEffect(() => {
    if (user && !profile && !isLoading && !isCreatingProfile) {
      // Auto-create profile for new users
      createProfile({
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
        email: user.email || '',
      });
    }
  }, [user, profile, isLoading, isCreatingProfile, createProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};