'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface TranscriptViewerProps {
  transcript: string;
}

export default function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(transcript);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedTranscript);
      setCopied(true);
      toast.success('Transcript copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy transcript');
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Full Transcript</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-2 text-sm bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors font-medium"
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6">
        {isEditing ? (
          <textarea
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            className="w-full h-96 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent resize-none font-mono text-sm bg-slate-50 text-slate-800"
            placeholder="Edit your transcript here..."
          />
        ) : (
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-mono text-sm">
              {editedTranscript}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
