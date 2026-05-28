import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface MediaUploaderProps {
  onFileSelect: (file: File, type: 'image' | 'video') => void;
  selectedFile: File | null;
  onClear: () => void;
}

export default function MediaUploader({ onFileSelect, selectedFile, onClear }: MediaUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      onFileSelect(file, 'image');
    } else if (file.type.startsWith('video/')) {
      onFileSelect(file, 'video');
    }
  };

  if (selectedFile) {
    return (
      <div className="relative w-full">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{selectedFile.name}</p>
            <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button
            onClick={onClear}
            className="flex-shrink-0 p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-slate-400'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileInput}
        className="hidden"
      />
      <div
        className="flex flex-col items-center gap-2"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-5 h-5 text-slate-500" />
        <div className="text-center">
          <p className="text-sm font-medium text-slate-900">Drag and drop your media</p>
          <p className="text-xs text-slate-500">or click to select</p>
        </div>
      </div>
    </div>
  );
}
