/*
  # Create Storage Bucket for Audio Recordings

  1. Storage
    - Create 'recordings' bucket for storing audio files
    - Enable public access for authenticated users
    - Set up security policies for bucket access

  2. Security
    - Allow authenticated users to upload recordings
    - Allow public access to read recordings
    - Restrict modifications to file owners
*/

-- Create the recordings bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow users to update their own files
CREATE POLICY "Allow users to update their own recordings"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'recordings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow users to delete their own files
CREATE POLICY "Allow users to delete their own recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow public access to read files
CREATE POLICY "Allow public access to recordings"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'recordings');