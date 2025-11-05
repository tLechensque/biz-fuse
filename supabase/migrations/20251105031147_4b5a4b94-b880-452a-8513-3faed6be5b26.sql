-- Criar políticas que permitem admin ver todos os perfis da mesma organização
-- SEM causar recursão infinita, usando diretamente a tabela user_roles

CREATE POLICY "Admins can view all profiles in their organization"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Usuário é admin e profile está na mesma organização
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'administrador'
  )
  AND organization_id IN (
    SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can update all profiles in their organization"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'administrador'
  )
  AND organization_id IN (
    SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can delete profiles in their organization"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'administrador'
  )
  AND organization_id IN (
    SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
  )
);