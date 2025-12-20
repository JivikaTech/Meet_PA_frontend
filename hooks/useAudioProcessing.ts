'use client';

import { useState } from 'react';
import { ProcessingStep, TranscribeResponse, SummaryResponse } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export function useAudioProcessing() {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string>('');

  const processAudio = async (file: File) => {
    try {
      setError(null);
      setCurrentStep('uploading');

      // Step 1: Upload audio
      toast.loading('Uploading audio file...', { id: 'upload' });
      const uploadResponse = await apiClient.uploadAudio(file);
      setMeetingId(uploadResponse.meetingId);
      toast.success('Audio uploaded successfully!', { id: 'upload' });

      // Step 2: Transcribe
      setCurrentStep('transcribing');
      toast.loading('Transcribing audio... This may take 2-3 minutes', { id: 'transcribe' });
      const transcribeResponse: TranscribeResponse = await apiClient.transcribeAudio(
        uploadResponse.meetingId,
        uploadResponse.s3Path
      );
      setTranscript(transcribeResponse.transcript);
      toast.success('Transcription complete!', { id: 'transcribe' });

      // Step 3: Generate summary
      setCurrentStep('summarizing');
      toast.loading('Generating AI summary...', { id: 'summarize' });
      const summaryResponse: SummaryResponse = await apiClient.generateSummary(
        transcribeResponse.transcript
      );
      setSummary(summaryResponse);
      toast.success('Summary generated!', { id: 'summarize' });

      // Complete
      setCurrentStep('complete');
      toast.success('All done! Your meeting notes are ready.', { id: 'complete' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setCurrentStep('error');
      toast.error(`Error: ${errorMessage}`, { id: 'error' });
      console.error('Error processing audio:', err);
    }
  };

  const reset = () => {
    setCurrentStep('idle');
    setTranscript('');
    setSummary(null);
    setError(null);
    setMeetingId('');
  };

  return {
    currentStep,
    transcript,
    summary,
    error,
    meetingId,
    processAudio,
    reset,
    isProcessing: ['uploading', 'transcribing', 'summarizing'].includes(currentStep),
  };
}
