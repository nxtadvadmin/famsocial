import { useState } from 'react';
import { Trash2, Loader, Heart, Circle, Star, Triangle } from 'lucide-react';
import { supabase, type Post, type Profile } from '../lib/supabase';
import MediaViewer from './MediaViewer';

interface PostCardProps {
  post: Post;
  currentProfileId: string | null;
  onDeleted: () => void;
}

const ICON_MAP = {
  heart: Heart,
  circle: Circle,
  star: Star,
  triangle: Triangle,
};

export default function PostCard({ post, currentProfileId, onDeleted }: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const profile = post.profiles as Profile | null;
  const isOwnPost = post.user_id === currentProfileId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('posts').delete().eq('id', post.id);
      if (error) throw error;
      onDeleted();
    } catch (err) {
      console.error('Failed to delete post:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  const IconComponent = profile?.icon ? ICON_MAP[profile.icon] : null;

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-3">
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-300">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                  {IconComponent ? <IconComponent className="w-4 h-4 text-blue-600" /> : <Circle className="w-4 h-4 text-slate-400" />}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-900">{profile?.name || 'Anonymous'}</span>
                {IconComponent && <IconComponent className="w-3 h-3 text-blue-500" />}
              </div>
              <p className="text-xs text-slate-500">{formatTime(post.created_at)}</p>
            </div>
          </div>

          {/* Delete button - only for own posts */}
          {isOwnPost && (
            <div className="relative">
              {!showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {showDeleteConfirm && (
                <div className="absolute right-0 top-0 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-10">
                  <p className="text-xs text-slate-700 mb-2 whitespace-nowrap">Delete post?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-xs px-2 py-1 hover:bg-slate-100 rounded transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-slate-400 transition-colors flex items-center gap-1"
                    >
                      {isDeleting && <Loader className="w-3 h-3 animate-spin" />}
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-slate-900 break-words">{post.content}</p>

        {post.media_url && post.media_type && (
          <div className="mt-4">
            <MediaViewer mediaUrl={post.media_url} mediaType={post.media_type} />
          </div>
        )}
      </div>
    </div>
  );
}
