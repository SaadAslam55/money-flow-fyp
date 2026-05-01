-- =============================================
-- STORAGE BUCKETS SETUP
-- Migration: 00003_storage_buckets.sql
-- =============================================

-- Create avatars bucket for user profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create organization-assets bucket for logos and branding
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-assets',
  'organization-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create receipts bucket for transaction receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create invoices bucket for invoice PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================
-- STORAGE POLICIES FOR avatars
-- =============================================

-- Allow anyone to view avatars (public profile pictures)
DROP POLICY IF EXISTS "avatars_select" ON storage.objects;
CREATE POLICY "avatars_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
CREATE POLICY "avatars_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- Allow authenticated users to update their own avatar
DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
CREATE POLICY "avatars_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- Allow authenticated users to delete their own avatar
DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;
CREATE POLICY "avatars_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- =============================================
-- STORAGE POLICIES FOR organization-assets
-- =============================================

-- Allow anyone to view organization assets (public logos)
DROP POLICY IF EXISTS "organization_assets_select" ON storage.objects;
CREATE POLICY "organization_assets_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'organization-assets');

-- Allow authenticated users to upload to their organization folder
DROP POLICY IF EXISTS "organization_assets_insert" ON storage.objects;
CREATE POLICY "organization_assets_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-assets'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::TEXT FROM public.users WHERE auth_user_id = auth.uid()
  )
);

-- Allow authenticated users to update their organization assets
DROP POLICY IF EXISTS "organization_assets_update" ON storage.objects;
CREATE POLICY "organization_assets_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'organization-assets'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::TEXT FROM public.users WHERE auth_user_id = auth.uid()
  )
);

-- Allow authenticated users to delete their organization assets
DROP POLICY IF EXISTS "organization_assets_delete" ON storage.objects;
CREATE POLICY "organization_assets_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-assets'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::TEXT FROM public.users WHERE auth_user_id = auth.uid()
  )
);

-- =============================================
-- STORAGE POLICIES FOR receipts
-- =============================================

-- Allow authenticated users to view receipts from their organization
DROP POLICY IF EXISTS "receipts_select" ON storage.objects;
CREATE POLICY "receipts_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::TEXT FROM public.users WHERE auth_user_id = auth.uid()
  )
);

-- Allow authenticated users to upload receipts to their organization folder
DROP POLICY IF EXISTS "receipts_insert" ON storage.objects;
CREATE POLICY "receipts_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::TEXT FROM public.users WHERE auth_user_id = auth.uid()
  )
);

-- Allow authenticated users to delete their organization receipts
DROP POLICY IF EXISTS "receipts_delete" ON storage.objects;
CREATE POLICY "receipts_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::TEXT FROM public.users WHERE auth_user_id = auth.uid()
  )
);

-- =============================================
-- STORAGE POLICIES FOR invoices
-- =============================================

-- Allow authenticated users to view invoices from their organization
DROP POLICY IF EXISTS "invoices_storage_select" ON storage.objects;
CREATE POLICY "invoices_storage_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'invoices'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::TEXT FROM public.users WHERE auth_user_id = auth.uid()
  )
);

-- Allow authenticated users to upload invoices to their organization folder
DROP POLICY IF EXISTS "invoices_storage_insert" ON storage.objects;
CREATE POLICY "invoices_storage_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'invoices'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::TEXT FROM public.users WHERE auth_user_id = auth.uid()
  )
);

-- Allow authenticated users to delete their organization invoices
DROP POLICY IF EXISTS "invoices_storage_delete" ON storage.objects;
CREATE POLICY "invoices_storage_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'invoices'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::TEXT FROM public.users WHERE auth_user_id = auth.uid()
  )
);
