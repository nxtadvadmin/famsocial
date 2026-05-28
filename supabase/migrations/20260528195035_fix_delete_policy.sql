/*
  # Fix delete policy for posts

  - Replace restrictive delete policy with permissive one
  - Since we use a custom identity system (name + icon), not Supabase Auth,
    we store the profile ID in localStorage and pass it for validation
  - For now, allow public delete (will be tightened with profile-based auth)
*/

DROP POLICY IF EXISTS "Post owner can delete own posts" ON posts;

CREATE POLICY "Public can delete posts"
  ON posts FOR DELETE
  TO public
  USING (true);
