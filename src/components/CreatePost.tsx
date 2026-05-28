import { useState } from 'react';
import { Send, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/useAuth';
import MediaUploader from './MediaUploader';

interface CreatePostProps {
  onPostCreated: () => void;
  profile: Profile;
}

export default function CreatePost({ onPostCreated, profile }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (file: File, type: 'image' | 'video') => {
    setSelectedFile(file);
    setMediaType(type);
  };

  const handleClearMedia = () => {
    setSelectedFile(null);
    setMediaType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;

    setIsLoading(true);
    setError('');

    try {
      let mediaUrl = null;
      let finalMediaType = null;

      if (selectedFile && mediaType) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-media`,
          {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const uploadData = await uploadResponse.json();
        mediaUrl = uploadData.url;
        finalMediaType = mediaType;
      }

      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          media_url: mediaUrl,
          media_type: finalMediaType,
          user_id: profile.id,
        });

      if (insertError) throw insertError;

      setContent('');
      handleClearMedia();
      onPostCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 border border-slate-200">
      <div className="space-y-4">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
        />

        <MediaUploader
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          onClear={handleClearMedia}
        />

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="flex justify-between items-center">
          <div className="text-xs text-slate-500">
            {content.length > 0 && <span>{content.length} characters</span>}
            {selectedFile && <span className="ml-4">Media attached</span>}
          </div>
          <button
            type="submit"
            disabled={isLoading || (!content.trim() && !selectedFile)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Post
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
