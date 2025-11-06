-- Criar tabela para templates v2 (Editor Visual)
CREATE TABLE IF NOT EXISTS public.proposal_templates_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  tokens_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS policies
ALTER TABLE public.proposal_templates_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates v2 in their organization"
  ON public.proposal_templates_v2
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.organization_id = proposal_templates_v2.organization_id
    )
  );

CREATE POLICY "Admins and managers can manage templates v2"
  ON public.proposal_templates_v2
  FOR ALL
  USING (can_manage_proposals(auth.uid()));

-- Índices para performance
CREATE INDEX idx_proposal_templates_v2_org ON public.proposal_templates_v2(organization_id);
CREATE INDEX idx_proposal_templates_v2_default ON public.proposal_templates_v2(is_default) WHERE is_default = true;

-- Tabela de histórico de versões (opcional mas útil)
CREATE TABLE IF NOT EXISTS public.proposal_template_versions_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.proposal_templates_v2(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  template_json JSONB NOT NULL,
  tokens_json JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.proposal_template_versions_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view template versions in their organization"
  ON public.proposal_template_versions_v2
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.proposal_templates_v2 pt
      JOIN public.profiles p ON p.organization_id = pt.organization_id
      WHERE pt.id = proposal_template_versions_v2.template_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and managers can create template versions"
  ON public.proposal_template_versions_v2
  FOR INSERT
  WITH CHECK (can_manage_proposals(auth.uid()));

CREATE INDEX idx_template_versions_v2_template ON public.proposal_template_versions_v2(template_id);
CREATE INDEX idx_template_versions_v2_version ON public.proposal_template_versions_v2(template_id, version_number);