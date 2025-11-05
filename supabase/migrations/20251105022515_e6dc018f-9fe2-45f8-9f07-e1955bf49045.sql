-- Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payment methods in their organization"
  ON public.payment_methods FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id = payment_methods.organization_id
  ));

CREATE POLICY "Admins can manage payment methods"
  ON public.payment_methods FOR ALL
  USING (public.is_admin(auth.uid()));

-- Create portfolio_items table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_urls TEXT[] DEFAULT '{}',
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  product_ids UUID[] DEFAULT '{}',
  brand_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view portfolio items in their organization"
  ON public.portfolio_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id = portfolio_items.organization_id
  ));

CREATE POLICY "Admins and managers can manage portfolio items"
  ON public.portfolio_items FOR ALL
  USING (public.can_manage_products(auth.uid()));

-- Create proposal_templates table
CREATE TABLE IF NOT EXISTS public.proposal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates in their organization"
  ON public.proposal_templates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id = proposal_templates.organization_id
  ));

CREATE POLICY "Admins and managers can manage templates"
  ON public.proposal_templates FOR ALL
  USING (public.can_manage_proposals(auth.uid()));

-- Create product_discounts table (for temporary promotional discounts)
CREATE TABLE IF NOT EXISTS public.product_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  discount_percentage NUMERIC NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  discount_amount NUMERIC CHECK (discount_amount >= 0),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT valid_target CHECK (
    (product_id IS NOT NULL AND brand_id IS NULL AND category_id IS NULL) OR
    (product_id IS NULL AND brand_id IS NOT NULL AND category_id IS NULL) OR
    (product_id IS NULL AND brand_id IS NULL AND category_id IS NOT NULL)
  )
);

ALTER TABLE public.product_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view discounts in their organization"
  ON public.product_discounts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id = product_discounts.organization_id
  ));

CREATE POLICY "Admins and managers can manage discounts"
  ON public.product_discounts FOR ALL
  USING (public.can_manage_products(auth.uid()));

-- Create proposal_sales table (to track sold products)
CREATE TABLE IF NOT EXISTS public.proposal_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC NOT NULL CHECK (total_price >= 0),
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.proposal_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sales in their organization"
  ON public.proposal_sales FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id = proposal_sales.organization_id
  ));

CREATE POLICY "Users can create sales in their organization"
  ON public.proposal_sales FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id = proposal_sales.organization_id
  ));

-- Update organizations table to add settings
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_org ON public.payment_methods(organization_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_org ON public.portfolio_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposal_templates_org ON public.proposal_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_product_discounts_org ON public.product_discounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_product_discounts_dates ON public.product_discounts(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_proposal_sales_org ON public.proposal_sales(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposal_sales_date ON public.proposal_sales(sale_date);