/*
  # Add Sharing Functionality

  1. New Tables
    - `shares`: Track shared content and permissions
      - `id` (uuid, primary key)
      - `resource_id` (uuid, the recording or note being shared)
      - `resource_type` (text, either 'recording' or 'note')
      - `owner_id` (uuid, the user sharing the content)
      - `shared_with_email` (text, recipient's email)
      - `permission_level` (text, 'view' or 'edit')
      - `status` (text, 'pending' or 'accepted')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on shares table
    - Add policies for managing shares
*/

CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('recording', 'note')),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  shared_with_email TEXT NOT NULL,
  permission_level TEXT NOT NULL DEFAULT 'view' CHECK (permission_level IN ('view', 'edit')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to create shares for their content
CREATE POLICY "Users can create shares"
  ON shares FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Policy to allow users to view shares they created or received
CREATE POLICY "Users can view relevant shares"
  ON shares FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR 
    shared_with_email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy to allow users to update shares they own
CREATE POLICY "Users can update their shares"
  ON shares FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

-- Policy to allow users to delete their shares
CREATE POLICY "Users can delete their shares"
  ON shares FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Update recordings and notes policies to allow shared access
CREATE POLICY "Users can access shared recordings"
  ON recordings FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM shares
      WHERE resource_id = recordings.id
      AND resource_type = 'recording'
      AND shared_with_email = (
        SELECT email FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can access shared notes"
  ON notes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM shares
      WHERE resource_id = notes.id
      AND resource_type = 'note'
      AND shared_with_email = (
        SELECT email FROM profiles WHERE id = auth.uid()
      )
    )
  );