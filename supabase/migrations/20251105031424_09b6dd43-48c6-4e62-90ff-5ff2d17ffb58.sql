-- Primeiro, remover as políticas problemáticas
DROP POLICY IF EXISTS "Admins can view all profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles in their organization" ON public.profiles;

-- Criar função SECURITY DEFINER para obter organization_id do usuário
-- sem causar recursão nas políticas RLS
CREATE OR REPLACE FUNCTION public.get_user_organization_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Agora criar políticas que usam essa função segura
CREATE POLICY "Admins can view all profiles in their organization"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid())
  AND organization_id = get_user_organization_id(auth.uid())
);

CREATE POLICY "Admins can update all profiles in their organization"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid())
  AND organization_id = get_user_organization_id(auth.uid())
);

CREATE POLICY "Admins can delete profiles in their organization"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  is_admin(auth.uid())
  AND organization_id = get_user_organization_id(auth.uid())
);

-- Adicionar política de UPDATE para organizations para admins
CREATE POLICY "Admins can update their organization"
ON public.organizations
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid())
  AND id = get_user_organization_id(auth.uid())
);