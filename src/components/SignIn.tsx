import { useState } from 'react';
import { Heart, Circle, Star, Triangle } from 'lucide-react';

type IconType = 'heart' | 'circle' | 'star' | 'triangle';

interface SignInProps {
  onSignIn: (name: string, icon: IconType) => Promise<unknown>;
}

const ICONS: { type: IconType; label: string; Icon: typeof Heart }[] = [
  { type: 'heart', label: 'Heart', Icon: Heart },
  { type: 'circle', label: 'Circle', Icon: Circle },
  { type: 'star', label: 'Star', Icon: Star },
  { type: 'triangle', label: 'Triangle', Icon: Triangle },
];

export default function SignIn({ onSignIn }: SignInProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<IconType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedIcon) return;

    setIsLoading(true);
    setError('');

    try {
      await onSignIn(name.trim(), selectedIcon);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = name.trim().length > 0 && selectedIcon !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Social Feed</h1>
          <p className="text-slate-600">Sign in to start sharing</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={30}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Choose Your Icon</label>
            <div className="grid grid-cols-4 gap-3">
              {ICONS.map(({ type, label, Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedIcon(type)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    selectedIcon === type
                      ? 'border-blue-500 bg-blue-50 shadow-sm scale-105'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-7 h-7 ${
                      selectedIcon === type ? 'text-blue-600' : 'text-slate-500'
                    }`}
                    fill={selectedIcon === type ? 'currentColor' : 'none'}
                    strokeWidth={selectedIcon === type ? 1.5 : 1.5}
                  />
                  <span
                    className={`text-xs font-medium ${
                      selectedIcon === type ? 'text-blue-700' : 'text-slate-600'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>
          )}

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
