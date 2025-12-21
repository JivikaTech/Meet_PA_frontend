'use client';

import { useState } from 'react';
import { Toaster } from 'sonner';
import AudioUploader from '@/components/AudioUploader';
import AudioRecorder from '@/components/AudioRecorder';
import LoadingStates from '@/components/LoadingStates';
import TranscriptViewer from '@/components/TranscriptViewer';
import SummaryPanel from '@/components/SummaryPanel';
import { useAudioProcessing } from '@/hooks/useAudioProcessing';
import { Mic, Upload as UploadIcon, RotateCcw, FileText, Sparkles, Layers } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  const [viewMode, setViewMode] = useState<'summary' | 'transcript'>('summary');
  const { 
    currentStep, 
    transcript, 
    summary, 
    enhancedSummary, 
    error, 
    processAudio, 
    reset, 
    isProcessing,
    processingInfo 
  } = useAudioProcessing();

  const handleFileSelect = (file: File) => {
    processAudio(file, { useEnhanced: true });
  };

  const handleNewMeeting = () => {
    reset();
    setViewMode('summary');
  };

  // Check if we have any summary available
  const hasSummary = enhancedSummary || summary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Meet PA</h1>
                <p className="text-sm text-gray-500">AI-Powered Meeting Intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Toggle for completed state */}
              {currentStep === 'complete' && hasSummary && (
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('summary')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'summary'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Summary
                  </button>
                  <button
                    onClick={() => setViewMode('transcript')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'transcript'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Transcript
                  </button>
                </div>
              )}
              
              {(currentStep === 'complete' || error) && (
                <button
                  onClick={handleNewMeeting}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>New Meeting</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentStep === 'idle' && (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex justify-center">
              <div className="bg-white rounded-xl border border-gray-200 p-1.5 inline-flex shadow-sm">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'upload'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <UploadIcon className="w-5 h-5" />
                  <span>Upload Audio</span>
                </button>
                <button
                  onClick={() => setActiveTab('record')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'record'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  <span>Record Audio</span>
                </button>
              </div>
            </div>

            {/* Content based on active tab */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                {activeTab === 'upload' ? (
                  <AudioUploader onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                ) : (
                  <AudioRecorder
                    onRecordingComplete={handleFileSelect}
                    isProcessing={isProcessing}
                  />
                )}
              </div>
            </div>

            {/* Features Section */}
            <div className="max-w-4xl mx-auto mt-12">
              <h2 className="text-center text-lg font-semibold text-gray-900 mb-6">
                Powered by AI for Better Meeting Notes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
                    <UploadIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Upload or Record</h3>
                  <p className="text-gray-600 text-sm">
                    Upload existing audio files or record meetings directly in your browser
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center mb-4">
                    <Mic className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Transcription</h3>
                  <p className="text-gray-600 text-sm">
                    Powered by AWS Transcribe for accurate speech-to-text conversion
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-xl flex items-center justify-center mb-4">
                    <Layers className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Hierarchical Summary</h3>
                  <p className="text-gray-600 text-sm">
                    Dynamic, Notion-like structure with nested topics, decisions & action items
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing States */}
        {isProcessing && (
          <div className="max-w-2xl mx-auto">
            <LoadingStates step={currentStep} />
            {processingInfo.strategy && currentStep === 'summarizing' && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Using {processingInfo.strategy.replace('_', '-')} processing for optimal results
              </p>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-red-800 font-semibold mb-2">Error Processing Audio</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={handleNewMeeting}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {currentStep === 'complete' && hasSummary && (
          <div className="space-y-4">
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800 font-medium flex items-center gap-2">
                <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Your meeting notes are ready!
                {enhancedSummary && (
                  <span className="text-green-600 font-normal">
                    • {enhancedSummary.structure.metadata.totalSections} sections • 
                    {enhancedSummary.structure.metadata.totalActionItems} action items • 
                    {enhancedSummary.structure.metadata.totalDecisions} decisions
                  </span>
                )}
              </p>
            </div>

            {/* View based on mode */}
            {viewMode === 'summary' ? (
              <SummaryPanel 
                summary={summary || undefined} 
                enhancedSummary={enhancedSummary || undefined} 
              />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <TranscriptViewer transcript={transcript} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 border-t border-gray-200 mt-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            Meet PA - Powered by AWS Transcribe & Claude AI • Hierarchical Meeting Intelligence
          </p>
        </div>
      </footer>
    </div>
  );
}
