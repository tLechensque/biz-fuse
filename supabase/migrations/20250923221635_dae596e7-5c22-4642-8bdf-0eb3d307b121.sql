-- CRITICAL SECURITY FIX: Fix infinite recursion in RLS policies

-- Step 1: Create security definer function to safely get user's organization_id
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Step 2: Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role = 'ADMIN' FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Step 3: Fix the problematic RLS policy on profiles table
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
CREATE POLICY "Users can view profiles in their organization"
ON public.profiles
FOR SELECT
USING (
  organization_id IS NOT NULL AND 
  organization_id = public.get_user_organization_id()
);

-- Step 4: Fix organization RLS policies to use security definer function
DROP POLICY IF EXISTS "Users can update their own organization" ON public.organizations;
CREATE POLICY "Users can update their own organization"
ON public.organizations
FOR UPDATE 
USING (
  id = public.get_user_organization_id() AND 
  public.is_user_admin()
);

DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
CREATE POLICY "Users can view their own organization"
ON public.organizations
FOR SELECT
USING (id = public.get_user_organization_id());

-- Step 5: Ensure all existing users have organization assignments
-- Update any profiles without organization_id to use the demo organization
UPDATE public.profiles 
SET organization_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE organization_id IS NULL;

-- Step 6: Make organization_id NOT NULL to prevent future issues
ALTER TABLE public.profiles 
ALTER COLUMN organization_id SET NOT NULL;

-- Step 7: Update the user creation trigger to ensure organization assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, organization_id)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    '550e8400-e29b-41d4-a716-446655440000'  -- Always assign to demo org
  );
  RETURN NEW;
END;
$$;