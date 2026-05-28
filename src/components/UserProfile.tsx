import { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Heart, Circle, Star, Triangle } from 'lucide-react';
import { supabase, type Post, type Profile } from '../lib/supabase';
import MediaViewer from './MediaViewer';

interface UserProfileProps {
  profileId: string;
  onBack: () => void;
}

const ICON_MAP = {
  heart: Heart,
  circle: Circle,
  star: Star,
  triangle: Triangle,
};

export default function UserProfile({ profileId, onBack }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', profileId).maybeSingle(),
          supabase
            .from('posts')
            .select('*, profiles(*)')
            .eq('user_id', profileId)
            .order('created_at', { ascending: false }),
        ]);

        if (profileRes.error) throw profileRes.error;
        if (postsRes.error) throw postsRes.error;

        setProfile(profileRes.data as Profile);
        setPosts(postsRes.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [profileId]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return <div className="text-center py-8 text-red-600">{error || 'Profile not found'}</div>;
  }

  const IconComponent = ICON_MAP[profile.icon];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to feed
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 border-2 border-slate-300">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100">
                <IconComponent className="w-7 h-7 text-blue-600" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
              <IconComponent className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-slate-500">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-500">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden p-5">
              <p className="text-xs text-slate-500 mb-3">{formatTime(post.created_at)}</p>
              <p className="text-slate-900 break-words">{post.content}</p>
              {post.media_url && post.media_type && (
                <div className="mt-4">
                  <MediaViewer mediaUrl={post.media_url} mediaType={post.media_type} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
