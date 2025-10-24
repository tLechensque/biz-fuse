-- Create enum for user roles
create type public.app_role as enum ('administrador', 'gerente', 'vendedor');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id),
  unique (user_id, role)
);

-- Create permissions table
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  resource text not null,
  action text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id)
);

-- Create role_permissions table
create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role app_role not null,
  permission_id uuid references public.permissions(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id),
  unique (role, permission_id)
);

-- Enable RLS
alter table public.user_roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

-- Security functions
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean 
language sql 
stable 
security definer 
set search_path = public
as $$ 
  select exists (
    select 1 
    from public.user_roles 
    where user_id = _user_id 
      and role = _role
  ) 
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean 
language sql 
stable 
security definer 
set search_path = public
as $$ 
  select exists (
    select 1 
    from public.user_roles 
    where user_id = _user_id 
      and role = 'administrador'
  ) 
$$;

-- RLS Policies
create policy "Admins manage user roles" 
  on public.user_roles 
  for all 
  to authenticated 
  using (public.is_admin(auth.uid()));

create policy "Admins manage permissions" 
  on public.permissions 
  for all 
  to authenticated 
  using (public.is_admin(auth.uid()));

create policy "Admins manage role permissions" 
  on public.role_permissions 
  for all 
  to authenticated 
  using (public.is_admin(auth.uid()));

-- Insert default permissions
insert into public.permissions (name, description, resource, action) values
  ('Criar Produtos', 'Permite criar novos produtos', 'products', 'create'),
  ('Ver Produtos', 'Permite visualizar produtos', 'products', 'read'),
  ('Editar Produtos', 'Permite editar produtos', 'products', 'update'),
  ('Deletar Produtos', 'Permite deletar produtos', 'products', 'delete'),
  ('Importar Produtos', 'Permite importar produtos', 'products', 'import'),
  ('Criar Clientes', 'Permite criar clientes', 'clients', 'create'),
  ('Ver Clientes', 'Permite visualizar clientes', 'clients', 'read'),
  ('Editar Clientes', 'Permite editar clientes', 'clients', 'update'),
  ('Deletar Clientes', 'Permite deletar clientes', 'clients', 'delete'),
  ('Criar Propostas', 'Permite criar propostas', 'proposals', 'create'),
  ('Ver Propostas', 'Permite visualizar propostas', 'proposals', 'read'),
  ('Editar Propostas', 'Permite editar propostas', 'proposals', 'update'),
  ('Deletar Propostas', 'Permite deletar propostas', 'proposals', 'delete'),
  ('Ver Todas Propostas', 'Permite ver propostas de todos', 'proposals', 'read_all'),
  ('Criar Usuários', 'Permite criar usuários', 'users', 'create'),
  ('Ver Usuários', 'Permite visualizar usuários', 'users', 'read'),
  ('Editar Usuários', 'Permite editar usuários', 'users', 'update'),
  ('Deletar Usuários', 'Permite deletar usuários', 'users', 'delete'),
  ('Gerenciar Permissões', 'Permite gerenciar permissões', 'permissions', 'manage');

-- Assign default permissions to administrador (all permissions)
insert into public.role_permissions (role, permission_id)
select 'administrador', id from public.permissions;

-- Assign default permissions to gerente (all except user management)
insert into public.role_permissions (role, permission_id)
select 'gerente', id from public.permissions 
where resource not in ('users', 'permissions');

-- Assign default permissions to vendedor (basic operations only)
insert into public.role_permissions (role, permission_id)
select 'vendedor', id from public.permissions 
where action in ('create', 'read', 'update') 
  and resource in ('products', 'clients', 'proposals');