'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File as FileIcon, X } from 'lucide-react';
import { toast } from 'sonner';

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function AudioUploader({ onFileSelect, isProcessing }: AudioUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file size (100MB max)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size exceeds 100MB limit');
        return;
      }

      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.webm', '.ogg'],
    },
    multiple: false,
    disabled: isProcessing,
  });

  const handleRemove = () => {
    setSelectedFile(null);
  };

  const handleProcess = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-5">
      <div
        {...getRootProps()}
        className={`rounded-xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-2 border-indigo-500 bg-indigo-50'
            : 'border-0 hover:bg-slate-100/50'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all ${
          isDragActive 
            ? 'bg-indigo-100 scale-110' 
            : 'bg-slate-100'
        }`}>
          <Upload className={`w-8 h-8 transition-colors ${
            isDragActive ? 'text-indigo-600' : 'text-slate-400'
          }`} />
        </div>
        {isDragActive ? (
          <p className="text-lg font-medium text-indigo-600">Drop the audio file here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium text-slate-900 mb-2">Drag & drop an audio file here, or click to select</p>
            <p className="text-sm text-slate-500">
              Supports: MP3, WAV, M4A, WebM, OGG (Max: 100MB)
            </p>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <FileIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{selectedFile.name}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type.split('/')[1].toUpperCase()}
                </p>
              </div>
            </div>
            {!isProcessing && (
              <button
                onClick={handleRemove}
                className="text-slate-400 hover:text-red-500 transition-colors ml-2 p-1 hover:bg-red-50 rounded-lg"
                aria-label="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {!isProcessing && (
            <button
              onClick={handleProcess}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
            >
              Process Audio
            </button>
          )}
        </div>
      )}
    </div>
  );
}
