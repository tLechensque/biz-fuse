-- Complete RLS policies for remaining tables

-- Kits policies
CREATE POLICY "Organization members can view kits" ON public.kits
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage kits" ON public.kits
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Kit items policies
CREATE POLICY "Organization members can view kit items" ON public.kit_items
  FOR SELECT USING (
    kit_id IN (
      SELECT k.id FROM public.kits k
      INNER JOIN public.profiles p ON k.organization_id = p.organization_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage kit items" ON public.kit_items
  FOR ALL USING (
    kit_id IN (
      SELECT k.id FROM public.kits k
      INNER JOIN public.profiles p ON k.organization_id = p.organization_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Portfolio items policies
CREATE POLICY "Organization members can view portfolio items" ON public.portfolio_items
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage portfolio items" ON public.portfolio_items
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Proposal items policies
CREATE POLICY "Organization members can view proposal items" ON public.proposal_items
  FOR SELECT USING (
    proposal_id IN (
      SELECT pr.id FROM public.proposals pr
      WHERE pr.user_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.clients c
        INNER JOIN public.profiles p ON c.organization_id = p.organization_id
        WHERE c.id = pr.client_id AND p.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can manage proposal items" ON public.proposal_items
  FOR ALL USING (
    proposal_id IN (
      SELECT pr.id FROM public.proposals pr
      WHERE pr.user_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.clients c
        INNER JOIN public.profiles p ON c.organization_id = p.organization_id
        WHERE c.id = pr.client_id AND p.user_id = auth.uid()
      )
    )
  );

-- Briefing templates policies
CREATE POLICY "Organization members can view briefing templates" ON public.briefing_templates
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage briefing templates" ON public.briefing_templates
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Proposal templates policies
CREATE POLICY "Organization members can view proposal templates" ON public.proposal_templates
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage proposal templates" ON public.proposal_templates
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Payment methods policies
CREATE POLICY "Organization members can view payment methods" ON public.payment_methods
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage payment methods" ON public.payment_methods
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );