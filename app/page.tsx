'use client';

import { useState } from 'react';
import { Toaster } from 'sonner';
import AudioUploader from '@/components/AudioUploader';
import AudioRecorder from '@/components/AudioRecorder';
import LoadingStates from '@/components/LoadingStates';
import TranscriptViewer from '@/components/TranscriptViewer';
import SummaryPanel from '@/components/SummaryPanel';
import { useAudioProcessing } from '@/hooks/useAudioProcessing';
import { 
  Mic, 
  Upload as UploadIcon, 
  RotateCcw, 
  FileText, 
  Sparkles, 
  Layers, 
  Zap, 
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Play
} from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Toaster position="top-right" richColors />

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Meet PA</h1>
              <p className="text-xs text-slate-500">AI-powered meeting intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {currentStep === 'complete' && hasSummary && (
              <div className="hidden sm:flex items-center bg-slate-100/80 rounded-xl p-1 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode('summary')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'summary' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Summary
                </button>
                <button
                  onClick={() => setViewMode('transcript')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'transcript' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20"
              >
                <RotateCcw className="w-4 h-4" />
                New
              </button>
            )}

            <a
              href="/chat"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {currentStep === 'idle' && (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium">
                <Zap className="w-4 h-4" />
                Zero-friction AI notetaker
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Turn meetings into
                </span>
                <br />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  actionable insights
                </span>
              </h2>
              
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Record or upload audio. Get AI summaries with key decisions, action items, and searchable transcripts.
              </p>
            </div>

            {/* Main Upload/Record Area */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/5 border border-slate-200/60 overflow-hidden">
                <div className="p-8">
                  {/* Tab Switcher */}
                  <div className="flex items-center justify-center mb-8">
                    <div className="bg-slate-50 rounded-2xl p-1.5 inline-flex border border-slate-200/60">
                      <button
                        onClick={() => setActiveTab('upload')}
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
                          activeTab === 'upload' 
                            ? 'bg-white text-slate-900 shadow-md shadow-slate-900/5' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <UploadIcon className="w-5 h-5" />
                        Upload audio
                      </button>
                      <button
                        onClick={() => setActiveTab('record')}
                        className={`flex items-center gap-3 px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
                          activeTab === 'record' 
                            ? 'bg-white text-slate-900 shadow-md shadow-slate-900/5' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Mic className="w-5 h-5" />
                        Record live
                      </button>
                    </div>
                  </div>

                  {/* Upload/Record Component */}
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                    {activeTab === 'upload' ? (
                      <AudioUploader onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                    ) : (
                      <AudioRecorder onRecordingComplete={handleFileSelect} isProcessing={isProcessing} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:shadow-slate-900/5 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Auto-transcribe</h3>
                <p className="text-sm text-slate-600">
                  Powered by AWS Transcribe for accurate speech-to-text conversion
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:shadow-slate-900/5 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI summaries</h3>
                <p className="text-sm text-slate-600">
                  Extract decisions, action items, and key topics automatically
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:shadow-slate-900/5 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Chat with notes</h3>
                <p className="text-sm text-slate-600">
                  Ask questions about your meetings and get instant answers
                </p>
              </div>
            </div>

            {/* Quick Tip */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Pro Tip</h3>
                    <p className="text-sm text-indigo-50">
                      After processing, head to the Chat page to ask questions like "Who's responsible for next steps?" or "What were the key decisions?"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-900/5 p-8">
              <LoadingStates step={currentStep} />
              {processingInfo.strategy && currentStep === 'summarizing' && (
                <div className="text-center mt-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Using {processingInfo.strategy.replace('_', ' ')} processing
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-red-200 rounded-3xl shadow-xl shadow-red-500/5 p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-900">Something went wrong</h3>
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={handleNewMeeting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'complete' && hasSummary && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg shadow-green-500/5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                    <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Meeting notes ready!</h3>
                    {enhancedSummary && (
                      <p className="text-sm text-green-700">
                        {enhancedSummary.structure.metadata.totalSections} sections • {enhancedSummary.structure.metadata.totalActionItems} action items • {enhancedSummary.structure.metadata.totalDecisions} decisions
                      </p>
                    )}
                  </div>
                </div>
                <a
                  href="/chat"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 font-medium"
                >
                  Start chatting
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Content Display */}
            {viewMode === 'summary' ? (
              <SummaryPanel 
                summary={summary || undefined} 
                enhancedSummary={enhancedSummary || undefined}
                transcript={transcript || undefined}
              />
            ) : (
              <TranscriptViewer transcript={transcript} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
