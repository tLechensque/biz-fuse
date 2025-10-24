-- Allow users to update their own profile name
alter table public.profiles 
  add column if not exists phone text,
  add column if not exists avatar_url text;

-- Create proposals table
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_id uuid references public.clients(id) on delete set null,
  client_name text not null,
  value numeric(10,2) not null default 0,
  status text not null default 'DRAFT',
  version integer not null default 1,
  margin numeric(5,2) default 0,
  description text,
  items jsonb default '[]'::jsonb,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null not null,
  created_by_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.proposals enable row level security;

-- RLS Policies for proposals
-- Users can view proposals in their organization
create policy "Users can view proposals in their organization"
  on public.proposals for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.organization_id = proposals.organization_id
    )
  );

-- Users can create proposals in their organization
create policy "Users can create proposals in their organization"
  on public.proposals for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.organization_id = proposals.organization_id
    )
    and auth.uid() = user_id
  );

-- Users can update their own proposals
create policy "Users can update their own proposals"
  on public.proposals for update
  using (auth.uid() = user_id);

-- Users can delete their own proposals
create policy "Users can delete their own proposals"
  on public.proposals for delete
  using (auth.uid() = user_id);

-- Admins and managers can update/delete all proposals in their organization
create policy "Admins and managers can manage all proposals"
  on public.proposals for update
  using (
    exists (
      select 1 from public.user_roles
      join public.profiles on profiles.user_id = user_roles.user_id
      where user_roles.user_id = auth.uid()
        and user_roles.role in ('administrador', 'gerente')
        and profiles.organization_id = proposals.organization_id
    )
  );

create policy "Admins and managers can delete all proposals"
  on public.proposals for delete
  using (
    exists (
      select 1 from public.user_roles
      join public.profiles on profiles.user_id = user_roles.user_id
      where user_roles.user_id = auth.uid()
        and user_roles.role in ('administrador', 'gerente')
        and profiles.organization_id = proposals.organization_id
    )
  );