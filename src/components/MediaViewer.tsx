import { useState } from 'react';
import { Play, X } from 'lucide-react';

interface MediaViewerProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
}

export default function MediaViewer({ mediaUrl, mediaType }: MediaViewerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (mediaType === 'image') {
    return (
      <div className="w-full rounded-lg overflow-hidden bg-slate-100">
        <img src={mediaUrl} alt="Post media" className="w-full h-auto max-h-96 object-cover" />
      </div>
    );
  }

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="relative w-full rounded-lg overflow-hidden bg-black cursor-pointer group"
      >
        <video
          src={mediaUrl}
          className="w-full h-auto max-h-96 object-cover"
          controlsList="nodownload"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <Play className="w-12 h-12 text-white fill-white" />
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-10 right-0 p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <video
              src={mediaUrl}
              autoPlay
              controls
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
