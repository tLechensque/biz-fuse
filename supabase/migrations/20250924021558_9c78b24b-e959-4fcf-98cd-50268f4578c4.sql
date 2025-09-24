-- Add stock field to products table
ALTER TABLE public.products 
ADD COLUMN stock integer DEFAULT 0 NOT NULL;