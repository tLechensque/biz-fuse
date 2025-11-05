-- Permitir que admins criem e excluam organizações
CREATE POLICY "Admins can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete organizations"
ON public.organizations
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));