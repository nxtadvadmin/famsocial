import { useState, useEffect, useCallback } from 'react';
import { supabase, type Profile } from './supabase';

export type { Profile };

const PROFILE_KEY = 'social_feed_profile';

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        supabase
          .from('profiles')
          .select('*')
          .eq('id', parsed.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              setProfile(data as Profile);
            } else {
              localStorage.removeItem(PROFILE_KEY);
            }
            setIsLoading(false);
          });
      } catch {
        localStorage.removeItem(PROFILE_KEY);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (name: string, icon: 'heart' | 'circle' | 'star' | 'triangle') => {
    // Try to find existing profile by name + icon
    const { data: existing, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('name', name)
      .eq('icon', icon)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      const p = existing as Profile;
      setProfile(p);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
      return p;
    }

    // Create new profile
    const { data, error } = await supabase
      .from('profiles')
      .insert({ name, icon })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create profile');

    const newProfile = data as Profile;
    setProfile(newProfile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    return newProfile;
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<Profile, 'name' | 'avatar_url'>>) => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update profile');

    const updated = data as Profile;
    setProfile(updated);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    return updated;
  }, [profile]);

  const signOut = useCallback(() => {
    setProfile(null);
    localStorage.removeItem(PROFILE_KEY);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profile.id)
      .maybeSingle();

    if (data) {
      const refreshed = data as Profile;
      setProfile(refreshed);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(refreshed));
    }
  }, [profile]);

  return { profile, isLoading, signIn, signOut, updateProfile, refreshProfile };
}
