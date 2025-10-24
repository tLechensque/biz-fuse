-- Add missing columns to products table
alter table public.products
  add column if not exists sku text,
  add column if not exists full_description text,
  add column if not exists simple_description text,
  add column if not exists cost_price numeric(10,2),
  add column if not exists sell_price numeric(10,2),
  add column if not exists brand text,
  add column if not exists unit text,
  add column if not exists video_url text,
  add column if not exists image_urls text[],
  add column if not exists stock integer default 0;

-- Drop old columns that are not in the interface
alter table public.products
  drop column if exists description,
  drop column if exists price;