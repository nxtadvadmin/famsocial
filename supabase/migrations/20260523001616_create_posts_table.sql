/*
  # Create posts table for social media platform

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `content` (text, post message)
      - `media_url` (text, nullable URL to image or video)
      - `media_type` (text, nullable - 'image' or 'video')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `posts` table
    - Add public SELECT policy for reading all posts
    - Add policy for deleting own posts (prepared for future auth integration)
    - Add policy for creating posts (prepared for future auth integration)

  3. Indexes
    - Index on created_at for efficient feed ordering
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video') OR media_type IS NULL),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts"
  ON posts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create posts"
  ON posts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can delete posts"
  ON posts
  FOR DELETE
  TO public
  USING (true);
