-- Drop existing policies to avoid conflicts (allows re-running)
DROP POLICY IF EXISTS "Public Access QR" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload QR" ON storage.objects;
DROP POLICY IF EXISTS "Owner Update QR" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete QR" ON storage.objects;

-- Policy 1: Allow Public Read Access to 'qr' bucket
CREATE POLICY "Public Access QR"
ON storage.objects FOR SELECT
USING ( bucket_id = 'qr' );

-- Policy 2: Allow Authenticated Users to Upload to 'qr' bucket
CREATE POLICY "Authenticated Upload QR"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'qr' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow Users to Update their own files in 'qr' bucket
CREATE POLICY "Owner Update QR"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'qr' 
  AND auth.uid() = owner
);

-- Policy 4: Allow Users to Delete their own files in 'qr' bucket
CREATE POLICY "Owner Delete QR"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'qr' 
  AND auth.uid() = owner
);

-- Fix for Security Warning: Enable RLS on VerificationCode table
-- (This is for your public table, so you should have permissions)
ALTER TABLE public."VerificationCode" ENABLE ROW LEVEL SECURITY;
