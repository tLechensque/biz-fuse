-- Add RLS policies for admins to manage all profiles in their organization

-- Admins can view all profiles in their organization
CREATE POLICY "Admins can view all profiles in organization"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'administrador'
      AND p.organization_id = profiles.organization_id
  )
);

-- Admins can update all profiles in their organization
CREATE POLICY "Admins can update all profiles in organization"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'administrador'
      AND p.organization_id = profiles.organization_id
  )
);

-- Admins can delete profiles in their organization
CREATE POLICY "Admins can delete profiles in organization"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'administrador'
      AND p.organization_id = profiles.organization_id
  )
);

-- Add UPDATE and DELETE policies for brands, categories, tags, and units

-- Brands
CREATE POLICY "Users can update brands in their organization"
ON public.brands
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization_id = brands.organization_id
  )
);

CREATE POLICY "Users can delete brands in their organization"
ON public.brands
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization_id = brands.organization_id
  )
);

-- Categories
CREATE POLICY "Users can update categories in their organization"
ON public.categories
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization_id = categories.organization_id
  )
);

CREATE POLICY "Users can delete categories in their organization"
ON public.categories
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization_id = categories.organization_id
  )
);

-- Tags
CREATE POLICY "Users can update tags in their organization"
ON public.tags
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization_id = tags.organization_id
  )
);

CREATE POLICY "Users can delete tags in their organization"
ON public.tags
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization_id = tags.organization_id
  )
);

-- Units
CREATE POLICY "Users can update units in their organization"
ON public.units
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization_id = units.organization_id
  )
);

CREATE POLICY "Users can delete units in their organization"
ON public.units
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization_id = units.organization_id
  )
);