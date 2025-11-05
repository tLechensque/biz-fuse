-- Add price list URL columns to brands and suppliers tables
ALTER TABLE public.brands
ADD COLUMN IF NOT EXISTS price_list_url TEXT;

ALTER TABLE public.suppliers
ADD COLUMN IF NOT EXISTS price_list_url TEXT;

-- Create storage bucket for price lists if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('price-lists', 'price-lists', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for price lists
CREATE POLICY "Users can view price lists in their organization"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'price-lists' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can upload price lists in their organization"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'price-lists' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can update price lists in their organization"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'price-lists' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can delete price lists in their organization"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'price-lists' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id::text = (storage.foldername(name))[1]
  )
);