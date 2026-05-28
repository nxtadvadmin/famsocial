import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { useAuth } from './lib/useAuth';
import SignIn from './components/SignIn';
import ProfileHeader from './components/ProfileHeader';
import CreatePost from './components/CreatePost';
import Feed from './components/Feed';

function App() {
  const { profile, isLoading, signIn, signOut, refreshProfile } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAvatarUpdate = async () => {
    await refreshProfile();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return <SignIn onSignIn={signIn} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Share2 className="w-7 h-7 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">Social Feed</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          <ProfileHeader
            profile={profile}
            onSignOut={signOut}
            onAvatarUpdate={handleAvatarUpdate}
          />

          <CreatePost onPostCreated={handlePostCreated} profile={profile} />

          <Feed refreshTrigger={refreshTrigger} currentProfileId={profile.id} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-slate-500">
          <p>Share your moments, connect with others</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
