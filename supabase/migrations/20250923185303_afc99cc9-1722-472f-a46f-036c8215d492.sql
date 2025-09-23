-- BizFuse Sales & Proposal Platform Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
CREATE TYPE proposal_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'REJECTED', 'APPROVED_TO_SEND', 'SENT', 'CLIENT_APPROVED', 'CLIENT_REJECTED', 'CLOSED');

-- Organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  min_profit_margin DECIMAL(5,2) DEFAULT 35.0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role DEFAULT 'USER' NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  full_description TEXT NOT NULL,
  simple_description TEXT NOT NULL,
  cost_price DECIMAL(12,2) NOT NULL,
  sell_price DECIMAL(12,2) NOT NULL,
  brand TEXT,
  unit TEXT DEFAULT 'pç' NOT NULL,
  video_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  last_price_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Product tags junction table
CREATE TABLE public.product_tags (
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (product_id, tag_id)
);

-- Clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Kits table
CREATE TABLE public.kits (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Kit items table
CREATE TABLE public.kit_items (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Portfolio items table
CREATE TABLE public.portfolio_items (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Proposals table
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  status proposal_status DEFAULT 'DRAFT' NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_cost DECIMAL(12,2) DEFAULT 0 NOT NULL,
  total_price DECIMAL(12,2) DEFAULT 0 NOT NULL,
  final_margin DECIMAL(5,2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Proposal items table
CREATE TABLE public.proposal_items (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL,
  grouping TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Briefing templates table
CREATE TABLE public.briefing_templates (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Proposal templates table
CREATE TABLE public.proposal_templates (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payment methods table
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  fees JSONB NOT NULL DEFAULT '{}',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefing_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organization-based access
-- Organizations (users can only see their own organization)
CREATE POLICY "Users can view their own organization" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own organization" ON public.organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Profiles (users can view profiles in their organization)
CREATE POLICY "Users can view profiles in their organization" ON public.profiles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Generic organization-scoped policies for other tables
CREATE POLICY "Organization members can view categories" ON public.categories
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage categories" ON public.categories
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can view tags" ON public.tags
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage tags" ON public.tags
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can view products" ON public.products
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage products" ON public.products
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can view product tags" ON public.product_tags
  FOR SELECT USING (
    product_id IN (
      SELECT p.id FROM public.products p
      INNER JOIN public.profiles pr ON p.organization_id = pr.organization_id
      WHERE pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage product tags" ON public.product_tags
  FOR ALL USING (
    product_id IN (
      SELECT p.id FROM public.products p
      INNER JOIN public.profiles pr ON p.organization_id = pr.organization_id
      WHERE pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can view clients" ON public.clients
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage clients" ON public.clients
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can view proposals" ON public.proposals
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.clients c
      INNER JOIN public.profiles p ON c.organization_id = p.organization_id
      WHERE c.id = proposals.client_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own proposals" ON public.proposals
  FOR ALL USING (user_id = auth.uid());

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kits_updated_at
  BEFORE UPDATE ON public.kits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_briefing_templates_updated_at
  BEFORE UPDATE ON public.briefing_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposal_templates_updated_at
  BEFORE UPDATE ON public.proposal_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX idx_products_organization_id ON public.products(organization_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_sku ON public.products(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_clients_organization_id ON public.clients(organization_id);
CREATE INDEX idx_proposals_user_id ON public.proposals(user_id);
CREATE INDEX idx_proposals_client_id ON public.proposals(client_id);
CREATE INDEX idx_proposals_status ON public.proposals(status);
CREATE INDEX idx_proposal_items_proposal_id ON public.proposal_items(proposal_id);
CREATE INDEX idx_kit_items_kit_id ON public.kit_items(kit_id);

-- Insert default data
INSERT INTO public.organizations (id, name, min_profit_margin) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Organization', 35.0);

-- Insert sample payment methods
INSERT INTO public.payment_methods (name, fees, organization_id)
VALUES 
  ('À Vista', '{"1": 0}', '00000000-0000-0000-0000-000000000001'),
  ('Cartão de Crédito', '{"1": 5.0, "2": 7.5, "6": 10.0, "12": 13.0}', '00000000-0000-0000-0000-000000000001'),
  ('PIX', '{"1": 2.5}', '00000000-0000-0000-0000-000000000001');

-- Insert sample categories
INSERT INTO public.categories (name, organization_id)
VALUES 
  ('Automação Residencial', '00000000-0000-0000-0000-000000000001'),
  ('Iluminação', '00000000-0000-0000-0000-000000000001'),
  ('Segurança', '00000000-0000-0000-0000-000000000001'),
  ('Audio & Video', '00000000-0000-0000-0000-000000000001');