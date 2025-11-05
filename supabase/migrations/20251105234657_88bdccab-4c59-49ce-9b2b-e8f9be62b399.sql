-- Remove price_list_url from brands and suppliers
ALTER TABLE public.brands DROP COLUMN IF EXISTS price_list_url;
ALTER TABLE public.suppliers DROP COLUMN IF EXISTS price_list_url;

-- Create price_tables table
CREATE TABLE IF NOT EXISTS public.price_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT NOT NULL,
  supplier_ids UUID[] DEFAULT '{}',
  brand_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on price_tables
ALTER TABLE public.price_tables ENABLE ROW LEVEL SECURITY;

-- RLS policies for price_tables
CREATE POLICY "Users can view price tables in their organization"
ON public.price_tables FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id = price_tables.organization_id
  )
);

CREATE POLICY "Users can create price tables in their organization"
ON public.price_tables FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id = price_tables.organization_id
  )
);

CREATE POLICY "Users can update price tables in their organization"
ON public.price_tables FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id = price_tables.organization_id
  )
);

CREATE POLICY "Users can delete price tables in their organization"
ON public.price_tables FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id = price_tables.organization_id
  )
);