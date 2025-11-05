-- Expandir tabela organizations com dados completos
ALTER TABLE public.organizations
ADD COLUMN razao_social TEXT,
ADD COLUMN cnpj TEXT,
ADD COLUMN endereco TEXT,
ADD COLUMN telefone TEXT,
ADD COLUMN whatsapp TEXT,
ADD COLUMN email TEXT,
ADD COLUMN tipo TEXT DEFAULT 'matriz' CHECK (tipo IN ('matriz', 'filial', 'independente')),
ADD COLUMN matriz_id UUID REFERENCES public.organizations(id);

-- Criar tabela de fornecedores
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  razao_social TEXT,
  cnpj TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view suppliers in their organization"
ON public.suppliers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization_id = suppliers.organization_id
  )
);

CREATE POLICY "Users can create suppliers in their organization"
ON public.suppliers FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization_id = suppliers.organization_id
  )
);

CREATE POLICY "Users can update suppliers in their organization"
ON public.suppliers FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization_id = suppliers.organization_id
  )
);

CREATE POLICY "Users can delete suppliers in their organization"
ON public.suppliers FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.organization_id = suppliers.organization_id
  )
);

-- Adicionar supplier_id à tabela brands
ALTER TABLE public.brands
ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id);

-- Melhorar tabela payment_methods para suportar parcelamento
ALTER TABLE public.payment_methods
ADD COLUMN type TEXT DEFAULT 'other' CHECK (type IN ('credit_card', 'debit_card', 'pix', 'bank_transfer', 'cash', 'other')),
ADD COLUMN max_installments INTEGER DEFAULT 1,
ADD COLUMN installments_config JSONB DEFAULT '[]'::jsonb,
ADD COLUMN fee_percentage NUMERIC(5,2) DEFAULT 0,
ADD COLUMN fee_per_installment JSONB DEFAULT '[]'::jsonb,
ADD COLUMN interest_free_installments INTEGER DEFAULT 0;

-- Melhorar tabela product_discounts para múltiplas seleções
ALTER TABLE public.product_discounts
DROP COLUMN product_id,
DROP COLUMN brand_id,
DROP COLUMN category_id,
ADD COLUMN product_ids UUID[] DEFAULT '{}',
ADD COLUMN brand_ids UUID[] DEFAULT '{}',
ADD COLUMN category_ids UUID[] DEFAULT '{}',
ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id);

-- Melhorar proposal_templates para suportar HTML customizado
ALTER TABLE public.proposal_templates
ADD COLUMN template_type TEXT DEFAULT 'simple' CHECK (template_type IN ('simple', 'html', 'visual')),
ADD COLUMN html_content TEXT,
ADD COLUMN visual_config JSONB DEFAULT '{}'::jsonb;