import { useState } from 'react';
import { Trash2, Loader } from 'lucide-react';
import { supabase, type Post } from '../lib/supabase';
import MediaViewer from './MediaViewer';

interface PostCardProps {
  post: Post;
  onDeleted: () => void;
}

export default function PostCard({ post, onDeleted }: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 font-medium">{formatTime(post.created_at)}</p>
          </div>
          <div className="relative">
            {!showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-red-600"
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
