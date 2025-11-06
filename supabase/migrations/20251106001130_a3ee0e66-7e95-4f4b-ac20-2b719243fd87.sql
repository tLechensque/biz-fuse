-- Storage policies for private bucket 'price-lists' to allow org-scoped access
-- Cleanup existing policies with same names (safe if they don't exist)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Price lists: read org folder'
  ) THEN
    DROP POLICY "Price lists: read org folder" ON storage.objects;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Price lists: upload to org folder'
  ) THEN
    DROP POLICY "Price lists: upload to org folder" ON storage.objects;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Price lists: update org folder'
  ) THEN
    DROP POLICY "Price lists: update org folder" ON storage.objects;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Price lists: delete org folder'
  ) THEN
    DROP POLICY "Price lists: delete org folder" ON storage.objects;
  END IF;
END $$;

-- Allow authenticated users to read files only in their organization folder
CREATE POLICY "Price lists: read org folder"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'price-lists'
  AND public.get_user_organization_id(auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to upload files only to their organization folder
CREATE POLICY "Price lists: upload to org folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'price-lists'
  AND public.get_user_organization_id(auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update files only within their organization folder
CREATE POLICY "Price lists: update org folder"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'price-lists'
  AND public.get_user_organization_id(auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'price-lists'
  AND public.get_user_organization_id(auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete files only within their organization folder
CREATE POLICY "Price lists: delete org folder"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'price-lists'
  AND public.get_user_organization_id(auth.uid())::text = (storage.foldername(name))[1]
);