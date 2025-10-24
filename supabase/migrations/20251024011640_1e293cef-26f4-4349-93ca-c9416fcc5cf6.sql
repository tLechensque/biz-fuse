-- Create categories table
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (name, organization_id)
);

-- Create products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2),
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create product_tags junction table
create table public.product_tags (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (product_id, tag_id)
);

-- Enable RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_tags enable row level security;

-- RLS Policies for categories
create policy "Users can view categories in their organization"
  on public.categories for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.organization_id = categories.organization_id
    )
  );

create policy "Users can create categories in their organization"
  on public.categories for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.organization_id = categories.organization_id
    )
  );

-- RLS Policies for products
create policy "Users can view products in their organization"
  on public.products for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.organization_id = products.organization_id
    )
  );

create policy "Users can create products in their organization"
  on public.products for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.organization_id = products.organization_id
    )
  );

create policy "Users can update products in their organization"
  on public.products for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.organization_id = products.organization_id
    )
  );

create policy "Users can delete products in their organization"
  on public.products for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.organization_id = products.organization_id
    )
  );

-- RLS Policies for product_tags
create policy "Users can view product_tags in their organization"
  on public.product_tags for select
  using (
    exists (
      select 1 from public.products
      join public.profiles on profiles.user_id = auth.uid()
      where products.id = product_tags.product_id
        and profiles.organization_id = products.organization_id
    )
  );

create policy "Users can create product_tags in their organization"
  on public.product_tags for insert
  with check (
    exists (
      select 1 from public.products
      join public.profiles on profiles.user_id = auth.uid()
      where products.id = product_tags.product_id
        and profiles.organization_id = products.organization_id
    )
  );

create policy "Users can delete product_tags in their organization"
  on public.product_tags for delete
  using (
    exists (
      select 1 from public.products
      join public.profiles on profiles.user_id = auth.uid()
      where products.id = product_tags.product_id
        and profiles.organization_id = products.organization_id
    )
  );