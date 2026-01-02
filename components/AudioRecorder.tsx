'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';

interface AudioRecorderProps {
  onRecordingComplete: (file: File) => void;
  isProcessing: boolean;
}

export default function AudioRecorder({ onRecordingComplete, isProcessing }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Determine MIME type based on browser support
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone. Please grant permission.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.info('Recording paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.info('Recording resumed');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast.success('Recording stopped');
    }
  };

  const handleProcess = () => {
    if (audioBlob) {
      const file = new File([audioBlob], `recording-${Date.now()}.webm`, {
        type: audioBlob.type,
      });
      onRecordingComplete(file);
    }
  };

  const handleReset = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    chunksRef.current = [];
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl p-10 text-center">
        {!isRecording && !audioBlob && (
          <div>
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
              <Mic className="w-10 h-10 text-white" />
            </div>
            <p className="text-lg font-medium text-slate-900 mb-6">Ready to record your meeting</p>
            <button
              onClick={startRecording}
              disabled={isProcessing}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-10 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
            >
              Start Recording
            </button>
          </div>
        )}

        {isRecording && (
          <div>
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
              isPaused 
                ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30' 
                : 'bg-gradient-to-br from-red-500 to-rose-500 animate-pulse shadow-red-500/30'
            }`}>
              <Mic className="w-10 h-10 text-white" />
            </div>
            <div className="text-5xl font-mono font-bold text-slate-900 mb-3">
              {formatTime(recordingTime)}
            </div>
            <p className="text-sm font-medium text-slate-600 mb-8">
              {isPaused ? 'Recording paused' : 'Recording in progress...'}
            </p>
            <div className="flex justify-center gap-3">
              {!isPaused ? (
                <button
                  onClick={pauseRecording}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-7 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/30"
                >
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 px-7 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/30"
                >
                  <Play className="w-5 h-5" />
                  <span>Resume</span>
                </button>
              )}
              <button
                onClick={stopRecording}
                className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 px-7 rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all flex items-center gap-2 shadow-lg shadow-red-500/30"
              >
                <Square className="w-5 h-5" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        )}

        {!isRecording && audioBlob && (
          <div>
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
              <Mic className="w-10 h-10 text-white" />
            </div>
            <p className="text-xl font-semibold text-slate-900 mb-2">Recording Complete!</p>
            <p className="text-sm text-slate-600 mb-8">
              Duration: {formatTime(recordingTime)} • Size: {(audioBlob.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {!isProcessing && (
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="bg-slate-200 text-slate-700 py-3 px-7 rounded-xl font-semibold hover:bg-slate-300 transition-all"
                >
                  Record Again
                </button>
                <button
                  onClick={handleProcess}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-7 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
                >
                  Process Recording
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
        <p className="text-sm text-indigo-900">
          <strong>Tip:</strong> Make sure you&apos;re in a quiet environment for the best transcription quality.
        </p>
      </div>
    </div>
  );
}
