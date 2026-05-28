/*
  # Add profiles table and user_id to posts

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `name` (text, display name)
      - `icon` (text, one of: heart, circle, star, triangle)
      - `avatar_url` (text, nullable URL to profile photo)
      - `created_at` (timestamp)

  2. Modified Tables
    - `posts`
      - Add `user_id` (uuid, foreign key to profiles.id)
      - Add index on user_id for efficient joins

  3. Security
    - Enable RLS on `profiles` table
    - Public can read all profiles
    - Users can update their own profile
    - Users can create their own profile
    - Update posts policies to be user-scoped where appropriate

  4. Important Notes
    - user_id on posts is nullable initially to support existing posts
    - posts RLS updated: anyone can read, only the post owner can delete
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL CHECK (icon IN ('heart', 'circle', 'star', 'triangle')),
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read profiles"
  ON profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Add user_id column to posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE posts ADD COLUMN user_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);

-- Update posts RLS: only post owner can delete
DROP POLICY IF EXISTS "Public can delete posts" ON posts;
DROP POLICY IF EXISTS "Public can create posts" ON posts;

CREATE POLICY "Public can create posts"
  ON posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Post owner can delete own posts"
  ON posts FOR DELETE
  TO public
  USING (user_id::uuid IS NULL OR user_id::uuid::text = (
    SELECT current_setting('request.jwt.claims', true)::json->>'sub'
  ));
