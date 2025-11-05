-- Remover as políticas problemáticas que causam recursão infinita
DROP POLICY IF EXISTS "Admins can view all profiles in organization" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles in organization" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles in organization" ON public.profiles;