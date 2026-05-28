import { useState, useRef } from 'react';
import { Camera, LogOut, Heart, Circle, Star, Triangle, Pencil, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/useAuth';

interface ProfileHeaderProps {
  profile: Profile;
  onSignOut: () => void;
  onAvatarUpdate: () => Promise<void>;
}

const ICON_MAP = {
  heart: Heart,
  circle: Circle,
  star: Star,
  triangle: Triangle,
};

export default function ProfileHeader({ profile, onSignOut, onAvatarUpdate }: ProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      formData.append('profileId', profile.id);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-avatar`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Upload failed');
      }

      await onAvatarUpdate();
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: editName.trim() })
        .eq('id', profile.id);

      if (error) throw error;
      await onAvatarUpdate();
      setIsEditingName(false);
    } catch (err) {
      console.error('Name update failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const IconComponent = ICON_MAP[profile.icon];

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 p-4">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-slate-300">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100">
                <IconComponent className="w-5 h-5 text-blue-600" />
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors border-2 border-white"
          >
            <Camera className="w-3 h-3" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* Name + Icon (icon is permanent) */}
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="text-sm px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                maxLength={30}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); }}
              />
              <IconComponent className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <button
                onClick={handleSaveName}
                disabled={isSaving}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setIsEditingName(false); setEditName(profile.name); }}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setIsEditingName(true)}
            >
              <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {profile.name}
              </p>
              <IconComponent className="w-4 h-4 text-blue-500" />
              <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        {/* Sign Out */}
        <button
          onClick={onSignOut}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
