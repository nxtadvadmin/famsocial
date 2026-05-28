import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { supabase, type Post } from '../lib/supabase';
import PostCard from './PostCard';

interface FeedProps {
  refreshTrigger: number;
  currentProfileId: string | null;
  selectedDate: Date;
  onViewProfile: (profileId: string) => void;
}

export default function Feed({ refreshTrigger, currentProfileId, selectedDate, onViewProfile }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = async () => {
    try {
      setError('');

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error: queryError } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      setPosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [refreshTrigger, selectedDate]);

  const handlePostDeleted = () => {
    loadPosts();
  };

  const isToday = () => {
    const now = new Date();
    return selectedDate.getFullYear() === now.getFullYear() &&
           selectedDate.getMonth() === now.getMonth() &&
           selectedDate.getDate() === now.getDate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-2">
          {isToday() ? 'No posts yet today' : `No posts on ${selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}`}
        </p>
        {isToday() && <p className="text-sm text-slate-400">Be the first to share something!</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          currentProfileId={currentProfileId}
          onDeleted={handlePostDeleted}
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  );
}
