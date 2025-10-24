-- Create profiles table
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null,
  email text not null,
  role text default 'USER',
  organization_id uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create organizations table
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tags table
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (name, organization_id)
);

-- Create clients table
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.tags enable row level security;
alter table public.clients enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- RLS Policies for organizations
create policy "Users can view their organization"
  on public.organizations for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.organization_id = organizations.id
    )
  );

-- RLS Policies for tags
create policy "Users can view tags in their organization"
  on public.tags for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.organization_id = tags.organization_id
    )
  );

create policy "Users can create tags in their organization"
  on public.tags for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.organization_id = tags.organization_id
    )
  );

-- RLS Policies for clients
create policy "Users can view clients in their organization"
  on public.clients for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.organization_id = clients.organization_id
    )
  );

create policy "Users can create clients in their organization"
  on public.clients for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.organization_id = clients.organization_id
    )
  );

create policy "Users can update clients in their organization"
  on public.clients for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.organization_id = clients.organization_id
    )
  );

create policy "Users can delete clients in their organization"
  on public.clients for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.organization_id = clients.organization_id
    )
  );

-- Insert default demo organization
insert into public.organizations (id, name) values 
  ('550e8400-e29b-41d4-a716-446655440000', 'Demo Organization');