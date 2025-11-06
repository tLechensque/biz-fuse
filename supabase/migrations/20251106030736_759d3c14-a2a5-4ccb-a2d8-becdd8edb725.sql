-- Adicionar campo logo_url na tabela organizations
ALTER TABLE organizations ADD COLUMN logo_url text;

-- Criar bucket de logos (público para visualização)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-logos',
  'organization-logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
);

-- RLS para o bucket de logos
CREATE POLICY "Usuários podem ver logos de suas organizações"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'organization-logos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Admins podem fazer upload de logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organization-logos'
  AND is_admin(auth.uid())
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins podem atualizar logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'organization-logos'
  AND is_admin(auth.uid())
);

CREATE POLICY "Admins podem deletar logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'organization-logos'
  AND is_admin(auth.uid())
);