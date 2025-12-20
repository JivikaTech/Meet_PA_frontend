'use client';

import { useState } from 'react';
import { Toaster } from 'sonner';
import AudioUploader from '@/components/AudioUploader';
import AudioRecorder from '@/components/AudioRecorder';
import LoadingStates from '@/components/LoadingStates';
import TranscriptViewer from '@/components/TranscriptViewer';
import SummaryPanel from '@/components/SummaryPanel';
import { useAudioProcessing } from '@/hooks/useAudioProcessing';
import { Mic, Upload as UploadIcon, RotateCcw } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  const { currentStep, transcript, summary, error, processAudio, reset, isProcessing } =
    useAudioProcessing();

  const handleFileSelect = (file: File) => {
    processAudio(file);
  };

  const handleNewMeeting = () => {
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meet PA</h1>
              <p className="text-gray-600 mt-1">AI-Powered Meeting Notetaker</p>
            </div>
            {(currentStep === 'complete' || error) && (
              <button
                onClick={handleNewMeeting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                <span>New Meeting</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'idle' && (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg border border-gray-200 p-2 inline-flex">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <UploadIcon className="w-5 h-5" />
                <span>Upload Audio</span>
              </button>
              <button
                onClick={() => setActiveTab('record')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'record'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Mic className="w-5 h-5" />
                <span>Record Audio</span>
              </button>
            </div>

            {/* Content based on active tab */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              {activeTab === 'upload' ? (
                <AudioUploader onFileSelect={handleFileSelect} isProcessing={isProcessing} />
              ) : (
                <AudioRecorder
                  onRecordingComplete={handleFileSelect}
                  isProcessing={isProcessing}
                />
              )}
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <UploadIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload or Record</h3>
                <p className="text-gray-600 text-sm">
                  Upload existing audio files or record meetings directly in your browser
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Transcription</h3>
                <p className="text-gray-600 text-sm">
                  Powered by AWS Transcribe for accurate speech-to-text conversion
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart Summary</h3>
                <p className="text-gray-600 text-sm">
                  Claude AI generates key points, decisions, and action items automatically
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Processing States */}
        {isProcessing && <LoadingStates step={currentStep} />}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">Error Processing Audio</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={handleNewMeeting}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {currentStep === 'complete' && transcript && summary && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                ✓ Your meeting notes are ready! Feel free to edit any section.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TranscriptViewer transcript={transcript} />
              <SummaryPanel summary={summary} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Meet PA - Powered by AWS Transcribe & Claude AI
          </p>
        </div>
      </footer>
    </div>
  );
}
