-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Create RLS policies for product images bucket
CREATE POLICY "Users can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their organization's product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their organization's product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(name, organization_id)
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view brands in their organization"
ON public.brands FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id = brands.organization_id
  )
);

CREATE POLICY "Users can create brands in their organization"
ON public.brands FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id = brands.organization_id
  )
);

-- Create units table
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(name, organization_id)
);

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view units in their organization"
ON public.units FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id = units.organization_id
  )
);

CREATE POLICY "Users can create units in their organization"
ON public.units FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id = units.organization_id
  )
);

-- Update products table to reference brands and units
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id),
  ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.units(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_unit_id ON public.products(unit_id);
CREATE INDEX IF NOT EXISTS idx_brands_organization_id ON public.brands(organization_id);
CREATE INDEX IF NOT EXISTS idx_units_organization_id ON public.units(organization_id);