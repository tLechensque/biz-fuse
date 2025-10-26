-- Add helper functions for role checking using SECURITY DEFINER
-- These functions bypass RLS and prevent recursive policy checks

-- Function to check if user is a manager
CREATE OR REPLACE FUNCTION public.is_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$ 
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = _user_id 
      AND role = 'gerente'
  ) 
$$;

-- Function to check if user is a seller
CREATE OR REPLACE FUNCTION public.is_seller(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$ 
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = _user_id 
      AND role = 'vendedor'
  ) 
$$;

-- Function to get all roles for a user (returns array)
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$ 
  SELECT ARRAY_AGG(role)::app_role[]
  FROM public.user_roles 
  WHERE user_id = _user_id
$$;

-- Function to check if user can manage users (admin only)
CREATE OR REPLACE FUNCTION public.can_manage_users(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$ 
  SELECT public.is_admin(_user_id)
$$;

-- Function to check if user can manage products (admin or manager)
CREATE OR REPLACE FUNCTION public.can_manage_products(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$ 
  SELECT public.is_admin(_user_id) OR public.is_manager(_user_id)
$$;

-- Function to check if user can manage proposals (admin or manager)
CREATE OR REPLACE FUNCTION public.can_manage_proposals(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$ 
  SELECT public.is_admin(_user_id) OR public.is_manager(_user_id)
$$;