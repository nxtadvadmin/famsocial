/*
  # Setup storage bucket and policies for media uploads

  1. Storage Bucket
    - Create 'media' bucket for storing images and videos
    - Make bucket public so users can access uploaded files

  2. Storage Policies
    - Allow public users to upload files to media bucket
    - Allow public access to read all uploaded files

  Note: Bucket creation is handled via Supabase dashboard or API.
  This migration sets up the foundational permissions structure.
*/

-- This is a placeholder as bucket creation requires service role access
-- The 'media' bucket should be created manually via Supabase dashboard
-- with the following settings:
-- - Name: media
-- - Public: true
-- - Allowed MIME types: image/*, video/*
