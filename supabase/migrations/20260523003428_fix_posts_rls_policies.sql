/*
  # Fix RLS policies for posts table to allow public uploads

  1. Changes
    - Remove restrictive INSERT policy
    - Add permissive INSERT policy that allows anyone to create posts
    - Keep DELETE and SELECT policies
    - Ensure posts are readable by all users

  2. Security Notes
    - Posts table uses permissive policies since this is a public social feed
    - Anyone can create, read, and delete posts (no authentication required)
    - This will be secured with auth when user profiles are added later
*/

DROP POLICY IF EXISTS "Anyone can create posts" ON posts;
DROP POLICY IF EXISTS "Anyone can read posts" ON posts;
DROP POLICY IF EXISTS "Anyone can delete posts" ON posts;

CREATE POLICY "Public can create posts"
  ON posts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can read posts"
  ON posts
  FOR SELECT
  USING (true);

CREATE POLICY "Public can delete posts"
  ON posts
  FOR DELETE
  USING (true);
